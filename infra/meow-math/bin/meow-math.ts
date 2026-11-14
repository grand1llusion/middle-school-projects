#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { MeowMathStack } from '../lib/meow-math-stack';

const app = new cdk.App();
new MeowMathStack(app, 'MeowMathStack', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: 'us-west-2' },
});
