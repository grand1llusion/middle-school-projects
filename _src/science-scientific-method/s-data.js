/* ---------- CONTENT (from the study guide, its answer key, and the class slides) ---------- */
/* [word, meaning, example, emoji] */
const WORDS = [
  ['Hypothesis','A testable prediction about what may happen in an investigation.','If plants get more light, then they will grow taller.','🔮'],
  ['Quantitative','Information that uses numbers or measurements.','The leaf is 8 cm long.','📏'],
  ['Qualitative','Information that describes color, shape, sound, or texture. Words, not numbers.','The leaf is dark green.','🎨'],
  ['Inference','A reasonable explanation based on what you observe.','The plant may need water.','💡'],
  ['Observation','Information you notice with your senses or tools.','The thermometer reads 18°C.','👀'],
  ['Model','A representation of something real.','A globe, or a small model volcano.','🌍'],
  ['Properties','Characteristics that help identify or compare materials.','Color, hardness, mass.','🧱'],
  ['Science','Knowledge gained from observations and experiments.','Testing which soil grows the tallest beans.','🔬'],
  ['Controlled experiment','A test where only one variable is changed. Everything else stays the same.','Only the water amount changes.','🧪'],
  ['Conclusion','Explains the results and whether the evidence supports the hypothesis.','The results support the hypothesis: 12 cm vs 8 cm.','📝'],
  ['Variable','A factor that can affect the result of an experiment.','Sunlight, water, temperature.','🎚️']
];
/* the nine words in the study guide's word bank */
const BANK = ['inference','qualitative','quantitative','properties','model','science','controlled experiment','hypothesis','conclusion'];

/* [statement, 'O' or 'I', why] */
const OI = [
  ['The liquid in the beaker is blue.','O','You can see the color.'],
  ['The dog is hiding because it is scared.','I','"Because" explains why.'],
  ['The thermometer reads 18°C.','O','18°C is a measurement.'],
  ['The sidewalk is wet, so it must have rained.','I','"Must have" is an explanation.'],
  ['It is raining outside.','O','You can see the rain.'],
  ['That dog looks mean.','I','"Looks mean" is an opinion.'],
  ['The plant is 12 cm tall.','O','12 cm is a measurement.'],
  ['The plant is drooping because it needs water.','I','"Because it needs water" explains.'],
  ['The sunset might look red because of the air.','I','"Might... because" suggests a cause.'],
  ['The temperature outside is 5°C.','O','5°C is a measurement.'],
  ['The dog is dangerous.','I','"Dangerous" is an interpretation.'],
  ['The boy is wearing a jacket.','O','You can see the jacket.'],
  ['The plant may need more water.','I','"May need" is an explanation.'],
  ['The rock feels rough.','O','You can feel the texture.'],
  ['The bell rang 3 times.','O','You can hear and count it.'],
  ['The milk smells sour, so it is probably old.','I','"Probably old" is an explanation.'],
  ['The cookie has 12 chocolate chips.','O','You can count them.'],
  ['The cat is purring because it is happy.','I','"Because it is happy" explains.'],
  ['The ice cube melted in 10 minutes.','O','You timed it.'],
  ['The baby is crying because she is hungry.','I','"Because she is hungry" explains.'],
  ['The water in the cup is 250 mL.','O','250 mL is a measurement.'],
  ['The coach must be angry.','I','"Must be" is a guess about why.'],
  ['The apple is red and shiny.','O','You can see it.'],
  ['The window broke, so a ball probably hit it.','I','"Probably" means you are explaining.']
];

/* [testable question, not testable question, what you would measure] */
const TESTQ = [
  ['How does fertilizer amount affect flower height?','What is the prettiest flower?','flower height (cm)'],
  ['Which type of soil helps bean plants grow the tallest?','Why are flowers beautiful?','plant height (cm)'],
  ['Does water temperature affect how fast sugar dissolves?','Is sugar better than salt?','time to dissolve (seconds)'],
  ['How does ramp height affect how far a toy car rolls?','Which toy car is the coolest?','distance rolled (cm)'],
  ['Does the amount of sunlight change how tall a seedling grows?','What is the best color for a flower pot?','seedling height (cm)'],
  ['Does adding salt change how fast ice melts?','Is winter the best season?','melting time (minutes)'],
  ['Which paper towel brand soaks up the most water?','Which paper towel has the nicest design?','water soaked up (mL)'],
  ['Does a ball bounce higher on grass or on concrete?','Which sport is the most fun?','bounce height (cm)']
];

/* fair tests: question, what changes (IV), what you measure, keep the same (correct), unfair choices */
const FAIR = [
  {q:'Two groups grow beans with different amounts of water.', iv:'amount of water', dv:'how tall the beans grow', same:['same soil','same seed type','same container size','same amount of light','same temperature'], bad:['different seed types','one group in a dark closet','a bigger pot for one group']},
  {q:'Does sunlight affect plant growth?', iv:'amount of sunlight', dv:'how tall the plants grow', same:['same soil','same pot','same amount of water','same plant type'], bad:['more water for one plant','different plant types','a bigger pot for one plant']},
  {q:'Does ramp height change how far a toy car rolls?', iv:'ramp height', dv:'distance the car rolls', same:['same toy car','same floor surface','same starting spot on the ramp'], bad:['a heavier car on the high ramp','carpet for one ramp','pushing the car on one ramp']},
  {q:'Does water temperature change how fast sugar dissolves?', iv:'water temperature', dv:'time for the sugar to dissolve', same:['same amount of water','same amount of sugar','same cup','same amount of stirring'], bad:['more sugar in the hot cup','stirring only one cup','a bigger cup of cold water']}
];

const STEPS = [
  ['Ask a question','What do I want to find out?'],
  ['Make a hypothesis','What do I predict?'],
  ['Write a procedure','How will I test it?'],
  ['Perform experiment / collect data','Do the test. Record results.'],
  ['Analyze data','Look for patterns.'],
  ['Draw a conclusion','Explain what the results show.']
];

/* if-then hypotheses: [if part, then part, IV, DV, a decoy that is neither] */
const IFS = [
  ['a ramp is raised higher','a toy car will travel farther','ramp height','distance the car travels','color of the car'],
  ['the temperature of water increases','sugar will dissolve faster','water temperature','how fast the sugar dissolves','size of the cup'],
  ['plants get sunlight','plants will grow','sunlight','plant growth','type of pot'],
  ['hands are washed with soap and water','germs will be killed','washing with soap and water','germs killed','time of day'],
  ['students use too much screen time','a headache will occur','screen time','headaches','type of phone'],
  ['more fertilizer is added','flowers will grow taller','amount of fertilizer','flower height','color of the flowers'],
  ['a ball is dropped from higher up','it will bounce higher','drop height','bounce height','color of the ball'],
  ['more salt is added to ice','the ice will melt faster','amount of salt','how fast the ice melts','shape of the bowl'],
  ['students sleep more hours','their test scores will go up','hours of sleep','test scores','name of the test'],
  ['a paper airplane has bigger wings','it will fly farther','wing size','distance it flies','color of the paper']
];

/* science and engineering practices: [what students do, practice] */
const PRACTICES = ['Asking questions','Developing and using models','Using mathematics','Communicating information'];
const SEP = [
  ['A class builds a small working representation of a volcano.',1],
  ['A student builds a small solar system to show how planets move around the Sun.',1],
  ['Students use a globe to show where the equator is.',1],
  ['Students find the average height of their bean plants.',2],
  ['A team calculates the mean of five measurements.',2],
  ['A scientist writes a report to share her results with others.',3],
  ['Students make a poster to explain their results to the class.',3],
  ['Students wonder why ice melts faster on the sidewalk than on grass.',0],
  ['A student asks, "Does the amount of light change how fast seeds sprout?"',0]
];

/* what a good graph needs (study guide #21) */
const GRAPH_GOOD = ['Title','Labeled x-axis','Labeled y-axis','Even scale'];
const GRAPH_BAD = ['Rainbow colors','A drawing of the plant','Your name in big letters','A pie chart'];
