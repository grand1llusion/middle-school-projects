import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as apigw from 'aws-cdk-lib/aws-apigatewayv2';
import { HttpJwtAuthorizer } from 'aws-cdk-lib/aws-apigatewayv2-authorizers';
import { HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as budgets from 'aws-cdk-lib/aws-budgets';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import * as path from 'path';

export class MeowMathStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // ── DynamoDB ───────────────────────────────────────────────────────────────
    const table = new dynamodb.Table(this, 'Table', {
      tableName: 'MeowMath',
      partitionKey: { name: 'pk', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'sk', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      pointInTimeRecoverySpecification: { pointInTimeRecoveryEnabled: true },
      timeToLiveAttribute: 'expiresAt',
      // RETAIN so cdk destroy never deletes family progress (note in README)
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    table.addGlobalSecondaryIndex({
      indexName: 'gsi1',
      partitionKey: { name: 'gsi1pk', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'gsi1sk', type: dynamodb.AttributeType.STRING },
    });

    // ── Cognito ────────────────────────────────────────────────────────────────
    const userPool = new cognito.UserPool(this, 'Parents', {
      userPoolName: 'meow-math-parents',
      selfSignUpEnabled: true,
      signInAliases: { email: true },
      autoVerify: { email: true },
      passwordPolicy: {
        minLength: 10,
        requireLowercase: false,
        requireUppercase: false,
        requireDigits: false,
        requireSymbols: false,
      },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    const userPoolClient = userPool.addClient('WebClient', {
      userPoolClientName: 'meow-math-web',
      authFlows: { userPassword: true },
      generateSecret: false,
      idTokenValidity: cdk.Duration.hours(1),
      accessTokenValidity: cdk.Duration.hours(1),
      refreshTokenValidity: cdk.Duration.days(365),
    });

    // ── Lambda ─────────────────────────────────────────────────────────────────
    const logGroup = new logs.LogGroup(this, 'HandlerLogs', {
      retention: logs.RetentionDays.TWO_WEEKS,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const fn = new NodejsFunction(this, 'Handler', {
      runtime: lambda.Runtime.NODEJS_24_X,
      entry: path.join(__dirname, '..', 'lambda', 'index.ts'),
      handler: 'handler',
      memorySize: 256,
      timeout: cdk.Duration.seconds(10),
      bundling: {
        minify: true,
        sourceMap: false,
        target: 'node24',
        externalModules: ['@aws-sdk/*'],
      },
      environment: {
        TABLE_NAME: table.tableName,
        USER_POOL_ID: userPool.userPoolId,
        USER_POOL_CLIENT_ID: userPoolClient.userPoolClientId,
        REGION: this.region,
      },
      logGroup,
    });

    table.grantReadWriteData(fn);
    fn.addToRolePolicy(new iam.PolicyStatement({
      actions: ['cognito-idp:AdminDeleteUser'],
      resources: [userPool.userPoolArn],
    }));

    // ── HTTP API ───────────────────────────────────────────────────────────────
    const integration = new HttpLambdaIntegration('Lambda', fn);
    const auth = new HttpJwtAuthorizer('CognitoAuth', userPool.userPoolProviderUrl, {
      jwtAudience: [userPoolClient.userPoolClientId],
    });

    const api = new apigw.HttpApi(this, 'Api', {
      apiName: 'meow-math',
      corsPreflight: {
        allowOrigins: ['https://grand1llusion.github.io', 'http://localhost:8080'],
        allowMethods: [
          apigw.CorsHttpMethod.GET,
          apigw.CorsHttpMethod.POST,
          apigw.CorsHttpMethod.PUT,
          apigw.CorsHttpMethod.DELETE,
          apigw.CorsHttpMethod.OPTIONS,
        ],
        allowHeaders: ['authorization', 'content-type'],
        maxAge: cdk.Duration.days(1),
      },
    });

    const pub = { integration };                        // public (no auth)
    const priv = { integration, authorizer: auth };     // requires Cognito JWT

    api.addRoutes({ path: '/v1/health',                                 methods: [apigw.HttpMethod.GET],             ...pub  });
    api.addRoutes({ path: '/v1/players',                                methods: [apigw.HttpMethod.POST, apigw.HttpMethod.GET], ...priv });
    api.addRoutes({ path: '/v1/players/{playerId}',                     methods: [apigw.HttpMethod.DELETE],          ...priv });
    api.addRoutes({ path: '/v1/players/{playerId}/progress',            methods: [apigw.HttpMethod.GET, apigw.HttpMethod.PUT], ...priv });
    api.addRoutes({ path: '/v1/players/{playerId}/clubs',               methods: [apigw.HttpMethod.GET],             ...priv });
    api.addRoutes({ path: '/v1/clubs',                                  methods: [apigw.HttpMethod.POST],            ...priv });
    api.addRoutes({ path: '/v1/clubs/join',                             methods: [apigw.HttpMethod.POST],            ...priv });
    api.addRoutes({ path: '/v1/clubs/{clubId}/members/{playerId}',      methods: [apigw.HttpMethod.DELETE],          ...priv });
    api.addRoutes({ path: '/v1/clubs/{clubId}/leaderboard',             methods: [apigw.HttpMethod.GET],             ...priv });
    api.addRoutes({ path: '/v1/account',                                methods: [apigw.HttpMethod.DELETE],          ...priv });

    // Default throttle on the auto-deployed $default stage
    const cfnStage = api.defaultStage?.node.defaultChild as apigw.CfnStage;
    if (cfnStage) {
      cfnStage.defaultRouteSettings = {
        throttlingBurstLimit: 20,
        throttlingRateLimit: 10,
      };
    }

    // ── Budget alarm ───────────────────────────────────────────────────────────
    new budgets.CfnBudget(this, 'Budget', {
      budget: {
        budgetName: 'meow-math-budget',
        budgetType: 'COST',
        timeUnit: 'MONTHLY',
        budgetLimit: { amount: 5, unit: 'USD' },
      },
      notificationsWithSubscribers: [{
        notification: {
          notificationType: 'ACTUAL',
          comparisonOperator: 'GREATER_THAN',
          threshold: 80,
          thresholdType: 'PERCENTAGE',
        },
        subscribers: [{ subscriptionType: 'EMAIL', address: 'bradley.papke@gmail.com' }],
      }],
    });

    // ── Outputs ────────────────────────────────────────────────────────────────
    new cdk.CfnOutput(this, 'ApiUrl',     { value: api.url ?? '' });
    new cdk.CfnOutput(this, 'UserPoolId', { value: userPool.userPoolId });
    new cdk.CfnOutput(this, 'ClientId',   { value: userPoolClient.userPoolClientId });
    new cdk.CfnOutput(this, 'Region',     { value: this.region });
  }
}
