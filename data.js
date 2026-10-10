'use strict';

// ---------- Equipment & locations ----------

const EQUIP = {
  chair: 'Chair, bench or bed edge',
  step: 'Stairs or a low step',
  table: 'Sturdy table',
  bar: 'Pull-up bar',
  dip: 'Dip bars',
  band: 'Resistance band',
};

const DEFAULT_LOCATIONS = {
  home: { n: 'Home', equip: ['chair', 'step', 'table'] },
  travel: { n: 'Travel', equip: ['chair'] },
  park: { n: 'Park / Gym', equip: ['chair', 'step', 'bar', 'dip'] },
};

// ---------- Exercises ----------
// t: 'r' reps | 's' seconds    d: default dose    s: per side
// e: equipment needed           k / b: knee / lower-back load (0 gentle, 1 moderate, 2 demanding)
// tempo: seconds per rep (for time estimates)   w: why it's in the program
// q: YouTube search phrase      alt: fallback when this one isn't allowed

const EX = {
  // Prep Drill (Army PRT-inspired warm-up)
  march: { n: 'March in Place', t: 's', d: 30, c: ['Drive knees up to a comfortable height', 'Swing arms opposite to legs', 'Stand tall and breathe steadily'] },
  armcircles: { n: 'Arm Circles', t: 's', d: 30, c: ['Arms straight out to the sides', 'Start small and grow the circles', 'Reverse direction halfway through'] },
  catcamel: { n: 'Cat-Camel', t: 's', d: 30, q: 'McGill cat camel', w: 'Gently moves the spine through its range to ease stiffness before loading it.', c: ['Hands and knees, pad under your knees', 'Slowly round your back, then let it sag gently', 'Easy motion, not a stretch: stop short of end range', 'About 3 seconds each direction'] },
  hinge: { n: 'Hip Hinge', t: 'r', d: 10, w: 'Teaches you to bend from the hips instead of the lower back, which protects your back all day.', c: ['Hands on hips, soft knees', 'Push hips back like closing a car door with your butt', 'Keep a long, neutral spine', 'Squeeze glutes to stand tall'] },
  legswings: { n: 'Leg Swings', t: 's', d: 15, s: true, c: ['Hold a wall for balance', 'Swing one leg forward and back, relaxed', 'Let the range grow gradually', 'Keep your torso upright'] },
  openbook: { n: 'Open Book', t: 'r', d: 5, s: true, tempo: 5, q: 'open book thoracic rotation', c: ['Lie on your side, knees bent up to hip height', 'Arms straight in front, palms together', 'Open the top arm across to the other side and follow it with your eyes', 'Keep knees stacked together'] },

  // Recovery Drill
  overheadpull: { n: 'Overhead Arm Pull', t: 's', d: 20, s: true, q: 'Army PRT overhead arm pull', c: ['Raise one arm and bend the elbow so your hand is behind your head', 'Gently pull the elbow with the other hand', 'Stand tall, ribs down'] },
  chestwall: { n: 'Wall Chest Stretch', t: 's', d: 20, s: true, c: ['Forearm on a wall or door frame, elbow at shoulder height', 'Turn your body away until you feel a stretch across the chest', 'Breathe slowly'] },
  hipflexor: { n: 'Standing Hip Flexor Stretch', t: 's', d: 25, s: true, w: 'Tight hip flexors pull on the lower back. Opening them up often eases back pain.', c: ['Staggered stance, back heel lifted', 'Tuck your pelvis under and squeeze the back-leg glute', 'Shift forward slightly. Feel it in the front of the back hip', "Don't arch your lower back"] },
  quadstretch: { n: 'Standing Quad Stretch', t: 's', d: 20, s: true, k: 1, alt: 'hipflexor', c: ['Hold a wall', 'Bring your heel toward your glute. Use a towel around the ankle if needed', 'Knees together, stand tall', 'Stop short of any knee pain'] },
  hamstringstretch: { n: 'Lying Hamstring Stretch', t: 's', d: 25, s: true, w: 'Lying down keeps your lower back supported, unlike toe touches.', c: ['On your back, one knee bent with the foot flat', 'Raise the other leg, hands behind the thigh (or a towel)', 'Keep your lower back relaxed on the floor'] },
  figure4: { n: 'Figure-4 Stretch', t: 's', d: 25, s: true, c: ['On your back, cross one ankle over the opposite knee', 'Pull the bottom thigh toward you', 'Feel it in the outer hip and glute'] },
  calfstretch: { n: 'Wall Calf Stretch', t: 's', d: 20, s: true, c: ['Hands on a wall, one foot back', 'Back heel down, back knee straight', 'Lean in until you feel the calf stretch'] },
  crocbreath: { n: 'Crocodile Breathing', t: 's', d: 45, w: 'Calms the nervous system and gently decompresses the lower back.', c: ['Lie face down, forehead on your hands', 'Breathe deep into your belly and lower back', 'Feel your back rise as you inhale', 'Long, slow exhales. Let everything relax'] },

  // Army "4 for the Core" pieces
  bentlegraise: { n: 'Bent-Leg Raise', t: 's', d: 30, b: 1, alt: 'deadbug', q: 'Army PRT bent leg raise', c: ['On your back, hands under your hips', 'Knees bent 90°, feet off the floor', 'Slowly bring knees toward chest, then lower until heels almost touch', 'Keep your lower back pressed down'] },
  bridgehold: { n: 'Glute Bridge Hold', t: 's', d: 30, q: 'Army PRT back bridge', c: ['On your back, knees bent, feet flat', 'Lift hips until your body is straight from knees to shoulders', 'Squeeze glutes hard and hold', 'Ribs down. The glutes do the work, not the back'] },

  // Push
  wallpush: { n: 'Wall Push-up', t: 'r', d: 12, c: ['Hands on the wall at shoulder height', 'Step back so your body leans in a straight line', 'Lower chest to the wall, elbows about 45° from your body', 'Push the wall away'] },
  inclinepush: { n: 'Incline Push-up', t: 'r', d: 10, e: ['chair'], q: 'incline push up', c: ['Hands on a sturdy counter, desk or bed edge', 'Body in one straight line. Squeeze glutes and brace', 'Lower your chest to the edge', 'Lower the surface over time to make it harder'] },
  kneepush: { n: 'Knee Push-up', t: 'r', d: 10, k: 1, c: ['Pad under your knees', 'Straight line from knees to head', 'Lower your chest between your hands', 'Elbows about 45°, not flared'] },
  pushup: { n: 'Push-up', t: 'r', d: 8, c: ['Hands slightly wider than shoulders', 'Body rigid from head to heels. Squeeze glutes, brace abs', 'Chest to a fist-height above the floor', 'Push the floor away'] },
  declinepush: { n: 'Decline Push-up', t: 'r', d: 8, e: ['chair'], b: 1, c: ['Feet on a chair or bed, hands on the floor', "Keep hips level. Don't let them sag", 'Lower under control', 'More weight on the upper chest and shoulders'] },
  archerpush: { n: 'Archer Push-up', t: 'r', d: 5, s: true, b: 1, c: ['Hands very wide', 'Shift your weight to one side as you lower; the other arm stays straight', 'Alternate sides', 'A big step toward one-arm push-ups'] },

  // Triceps & shoulders
  chairdipbent: { n: 'Chair Dip (Bent Knees)', t: 'r', d: 8, e: ['chair'], q: 'bench dip bent knees', c: ['Hands on the chair edge, fingers forward', 'Feet flat, knees bent', 'Lower until upper arms are about parallel, no deeper', 'Shoulders down, away from your ears'] },
  chairdip: { n: 'Chair Dip (Straight Legs)', t: 'r', d: 10, e: ['chair'], q: 'bench dip', c: ['Legs straight, heels on the floor', 'Lower slowly, upper arms to parallel', 'Stop if you feel pinching at the front of the shoulder'] },
  pikepush: { n: 'Pike Push-up', t: 'r', d: 6, q: 'pike push up beginner', c: ['Hips high, body in an upside-down V', 'Bend the elbows to bring your head toward the floor in front of your hands', 'Press back up', 'Builds shoulder strength'] },
  dipneg: { n: 'Dip Negative', t: 'r', d: 5, e: ['dip'], tempo: 6, c: ['Jump or step to the top position on the bars', 'Lower for 4–5 seconds', 'Stop when upper arms reach parallel', 'Step back up and repeat'] },
  bardip: { n: 'Parallel Bar Dip', t: 'r', d: 6, e: ['dip'], c: ['Start locked out on the bars, shoulders down', 'Lean slightly forward', 'Lower until upper arms are parallel', 'Press back to lockout'] },

  // Pull
  ytw: { n: 'Prone Y-T-W', t: 'r', d: 6, tempo: 6, q: 'prone Y T W raise', w: 'Builds the upper back and rear shoulders without any equipment. Good for posture.', c: ['Lie face down, forehead on a towel', 'Lift arms in a Y, then a T, then a W. That is one rep', 'Squeeze shoulder blades together and down', 'Thumbs up, small lifts. Quality beats height'] },
  bandrow: { n: 'Band Row', t: 'r', d: 12, e: ['band'], c: ['Anchor the band at chest height', 'Pull elbows back past your ribs', 'Squeeze shoulder blades together', 'Return slowly'] },
  tablerow: { n: 'Table Row', t: 'r', d: 8, e: ['table'], q: 'inverted row under table', c: ['Lie under a sturdy table and grip the edge', 'Heels on the floor, body straight', 'Pull your chest to the edge', 'Bend your knees to make it easier'] },
  deadhang: { n: 'Dead Hang', t: 's', d: 20, e: ['bar'], w: 'Builds grip and decompresses the spine.', c: ['Grip the bar shoulder-width', 'Hang with relaxed legs', 'Keep a little tension in the shoulders. Not fully limp'] },
  scappull: { n: 'Scapular Pull-up', t: 'r', d: 8, e: ['bar'], q: 'scapular pull up', c: ['Hang from the bar with straight arms', 'Pull shoulder blades down and back to lift your body an inch', 'Arms stay straight', 'Lower slowly'] },
  negpull: { n: 'Negative Pull-up', t: 'r', d: 4, e: ['bar'], tempo: 7, c: ['Step or jump so your chin is over the bar', 'Lower for 4–5 seconds', 'Control it all the way to straight arms', 'Reset and repeat'] },
  bandpull: { n: 'Band-Assisted Pull-up', t: 'r', d: 6, e: ['bar', 'band'], c: ['Loop the band over the bar, foot or knee in the band', 'Pull until your chin clears the bar', 'Lower under control'] },
  chinup: { n: 'Chin-up', t: 'r', d: 4, e: ['bar'], c: ['Palms facing you, shoulder-width', 'Pull your chest toward the bar', 'Chin over the bar, then lower to straight arms'] },
  pullup: { n: 'Pull-up', t: 'r', d: 5, e: ['bar'], c: ['Palms away, slightly wider than shoulders', 'Start by pulling the shoulders down', 'Drive elbows to your ribs, chin over the bar', 'Full hang at the bottom'] },

  // Squat
  sitstand: { n: 'Sit-to-Stand', t: 'r', d: 10, e: ['chair'], k: 1, alt: 'highwallsit', w: 'The most important strength move for staying strong as you age, and an easy one on a sore knee.', c: ['Sit on the front half of a chair, feet hip-width', 'Lean forward slightly and stand up without using your hands', 'Sit back down slowly. Take 3 seconds', 'Use a higher seat if your knee complains'] },
  boxsquat: { n: 'Box Squat', t: 'r', d: 10, e: ['chair'], k: 1, q: 'bodyweight box squat', c: ['Stand in front of a chair', 'Sit hips back until you lightly tap the seat', "Don't rest. Stand right back up", 'Knees track in line with your toes'] },
  squat: { n: 'Bodyweight Squat', t: 'r', d: 12, k: 1, c: ['Feet shoulder-width, toes slightly out', 'Sit back and down, chest proud', 'Knees follow your toes', 'Only go as deep as is pain-free. Depth comes with time'] },
  temposquat: { n: 'Tempo Squat', t: 'r', d: 8, k: 1, tempo: 6, q: 'tempo squat 3 second', c: ['Lower for 3 full seconds', 'Pause 1 second at the bottom', 'Stand up with control', 'Slow reps build the knee without impact'] },
  splitsquat: { n: 'Split Squat', t: 'r', d: 8, s: true, k: 2, c: ['Long staggered stance', 'Drop the back knee straight down toward the floor', 'Front heel stays planted', 'Hold a wall for balance if needed'] },
  bulgarian: { n: 'Rear-Foot Elevated Split Squat', t: 'r', d: 6, s: true, e: ['chair'], k: 2, q: 'bulgarian split squat', c: ['Back foot on a chair or bed', 'Lower straight down, front knee over the mid-foot', 'Drive through the front heel', 'Slow and controlled'] },
  singlebox: { n: 'Single-Leg Box Squat', t: 'r', d: 5, s: true, e: ['chair'], k: 2, q: 'single leg box squat', c: ['Stand on one leg in front of a chair', 'Sit back slowly until you touch the seat', 'Stand back up on the same leg', 'Arms forward for balance'] },

  // Single leg
  stepup: { n: 'Step-Up', t: 'r', d: 8, s: true, e: ['step'], k: 1, alt: 'suprevlunge', w: 'Strengthens the quad and glute that protect your knee, in a controlled range.', c: ['Whole foot on a low step', "Push through the top leg's heel. Don't push off the bottom foot", 'Stand tall at the top', 'Lower slowly, about 3 seconds'] },
  suprevlunge: { n: 'Supported Reverse Lunge', t: 'r', d: 6, s: true, e: ['chair'], k: 1, q: 'supported reverse lunge', c: ['Hold a chair or wall for balance', 'Step one foot back and lower the back knee', 'Front shin stays fairly vertical', 'Push through the front heel to return'] },
  revlunge: { n: 'Reverse Lunge', t: 'r', d: 8, s: true, k: 1, w: 'Stepping back is easier on the knee than stepping forward.', c: ['Step back and lower your back knee toward the floor', 'Keep your torso upright', 'Push through the front heel to stand', 'Alternate or do all reps on one side'] },
  stepdown: { n: 'Slow Step-Down', t: 'r', d: 6, s: true, e: ['step'], k: 2, tempo: 5, q: 'eccentric step down knee', w: 'Slow lowering is one of the best ways to strengthen the knee.', c: ['Stand on a step on one leg', 'Slowly lower the other heel to tap the floor. Take 3–4 seconds', 'Knee tracks over the middle toes', 'Push back up'] },
  laterallunge: { n: 'Lateral Lunge', t: 'r', d: 6, s: true, k: 2, c: ['Wide stance', 'Shift your hips back and over one foot, other leg straight', 'Chest up, heel down', 'Push back to center'] },
  walklunge: { n: 'Walking Lunge', t: 'r', d: 8, s: true, k: 2, c: ['Step forward and lower the back knee', 'Push up and step straight into the next lunge', 'Torso upright, steps long'] },

  // Hips & glutes
  bridge: { n: 'Glute Bridge', t: 'r', d: 12, w: 'Strong glutes take load off the lower back and the knee.', c: ['On your back, knees bent, feet flat hip-width', 'Squeeze glutes and lift until straight from knees to shoulders', 'Pause 2 seconds at the top', 'Ribs down. Glutes work, not the back'] },
  marchbridge: { n: 'Marching Bridge', t: 'r', d: 8, s: true, q: 'marching glute bridge', c: ['Hold a bridge', 'Lift one foot an inch or two, then the other', "Hips stay level. Don't let them dip"] },
  slbridge: { n: 'Single-Leg Glute Bridge', t: 'r', d: 8, s: true, c: ['One foot down, other knee pulled to your chest', 'Drive through the planted heel', 'Squeeze at the top, lower slowly'] },
  hipthrust: { n: 'Hip Thrust', t: 'r', d: 12, e: ['chair'], q: 'bodyweight hip thrust couch', c: ['Upper back on a couch, bed or bench edge', 'Feet flat, knees at 90° at the top', 'Drive hips up and squeeze the glutes', 'Chin tucked, ribs down'] },
  slrdl: { n: 'Single-Leg RDL', t: 'r', d: 6, s: true, k: 1, b: 1, q: 'bodyweight single leg romanian deadlift', c: ['Stand on one leg, slight knee bend', 'Hinge forward as the free leg reaches back', 'Flat back, hips square', 'Touch a wall for balance if needed'] },
  slhipthrust: { n: 'Single-Leg Hip Thrust', t: 'r', d: 8, s: true, e: ['chair'], c: ['Upper back on a couch or bench', 'One foot planted, other leg up', 'Drive up through the heel and squeeze'] },

  // Knee armor
  slr: { n: 'Straight-Leg Raise', t: 'r', d: 10, s: true, w: 'Wakes up the quad without bending a sore knee. A classic physio starter.', c: ['On your back, one knee bent', 'Tighten the thigh of the straight leg and lock the knee', 'Lift to the height of the other knee', 'Lower slowly'] },
  highwallsit: { n: 'High Wall Sit', t: 's', d: 30, w: 'Holding still under load can ease knee pain while building the quad.', c: ['Back flat on the wall', 'Slide down only 30–45°. Stay shallow', 'A quad burn is good. Sharp knee pain is not', 'Push evenly through both feet'] },
  tke: { n: 'Terminal Knee Extension', t: 'r', d: 12, s: true, e: ['band'], q: 'terminal knee extension band', c: ['Band anchored low, looped behind your knee', 'Start with the knee slightly bent', 'Straighten the knee fully against the band and squeeze the quad', 'Return slowly'] },
  wallsit: { n: 'Wall Sit', t: 's', d: 30, k: 1, c: ['Back flat on the wall', 'Slide down toward thighs parallel, or as far as is comfortable', 'Knees over ankles', 'Breathe and hold'] },
  spanish: { n: 'Spanish Squat', t: 's', d: 30, e: ['band'], k: 1, q: 'spanish squat band', c: ['Heavy band anchored around a post, behind both knees', 'Sit back into the band, shins vertical', 'Hold with the quads working hard'] },

  // Hip stability
  clamshell: { n: 'Clamshell', t: 'r', d: 12, s: true, w: 'Strengthens the glute muscle that keeps the knee from caving inward.', c: ['Lie on your side, knees bent, feet together', 'Lift the top knee without rolling your hips back', 'Pause at the top, lower slowly'] },
  sidelegraise: { n: 'Side-Lying Leg Raise', t: 'r', d: 10, s: true, c: ['Lie on your side, bottom knee bent', 'Top leg straight, toes pointing forward', 'Lift the leg slightly behind you', 'Lower slowly'] },
  bandwalk: { n: 'Banded Side Steps', t: 'r', d: 10, s: true, e: ['band'], c: ['Band around your legs above the knees', 'Quarter-squat stance', 'Step sideways, keeping tension on the band', 'Knees push out'] },
  sideplankleg: { n: 'Side Plank Leg Lift', t: 'r', d: 8, s: true, b: 1, q: 'side plank leg lift', c: ['Side plank on the elbow (knees down is fine)', 'Lift the top leg', 'Hips stay up and forward'] },

  // Calves
  calfraise: { n: 'Calf Raise', t: 'r', d: 15, c: ['Hold a wall for balance', 'Rise high onto the balls of your feet', 'Pause, then lower slowly'] },
  stepcalf: { n: 'Calf Raise off Step', t: 'r', d: 12, e: ['step'], c: ['Balls of your feet on a step edge', 'Lower the heels below the step', 'Rise all the way up'] },
  slcalf: { n: 'Single-Leg Calf Raise', t: 'r', d: 10, s: true, c: ['Stand on one foot, light hand on a wall', 'Rise high, lower slowly'] },

  // Core: front
  curlup: { n: 'McGill Curl-Up', t: 'r', d: 5, tempo: 10, q: 'McGill curl up', w: 'One of the "Big 3" from spine researcher Dr. Stuart McGill. It builds the abs without bending the spine.', c: ['On your back, one knee bent, other leg straight', 'Hands under the arch of your lower back', 'Brace lightly and lift head and shoulders about an inch', 'Hold 8 seconds and keep breathing. Lower and repeat'] },
  deadbug: { n: 'Dead Bug', t: 'r', d: 6, s: true, tempo: 4, w: 'Trains the core to hold the spine still while the limbs move.', c: ['On your back, arms up, knees over hips', 'Press your lower back gently into the floor', 'Lower the opposite arm and leg slowly', 'Return and switch sides'] },
  inclineplank: { n: 'Incline Plank', t: 's', d: 30, e: ['chair'], c: ['Forearms or hands on a bed, couch or bench', 'Body in a straight line', 'Squeeze glutes and brace'] },
  plank: { n: 'Front Plank', t: 's', d: 30, c: ['Forearms down, elbows under shoulders', 'Straight line from head to heels', 'Squeeze glutes, brace abs, breathe'] },
  shouldertaps: { n: 'Plank Shoulder Taps', t: 'r', d: 8, s: true, b: 1, c: ['High plank, feet a little wide', 'Tap the opposite shoulder', 'Keep hips still. No rocking'] },
  hollow: { n: 'Hollow Hold', t: 's', d: 20, b: 1, q: 'hollow body hold beginner', c: ['Lower back pressed into the floor', 'Knees tucked to start, then extend the legs over time', 'Shoulders slightly off the floor'] },
  hangknee: { n: 'Hanging Knee Raise', t: 'r', d: 8, e: ['bar'], b: 1, c: ['Hang from the bar', 'Bring your knees up toward your chest', 'Lower slowly, no swinging'] },

  // Core: side
  sideplankknee: { n: 'Side Plank (Knees)', t: 's', d: 20, s: true, q: 'McGill side plank knees', w: 'One of McGill\'s "Big 3". It builds the side core that stabilizes the spine.', c: ['On your side, elbow under shoulder, knees bent', 'Lift your hips so you form a straight line from knees to head', 'Hold and breathe'] },
  sideplank: { n: 'Side Plank', t: 's', d: 25, s: true, c: ['Elbow under shoulder, legs straight, feet stacked or staggered', 'Lift your hips into a straight line', 'Hold and breathe'] },
  sideplankreach: { n: 'Side Plank Reach-Through', t: 'r', d: 6, s: true, b: 1, c: ['Side plank on the elbow', 'Reach the top arm under your body, then back up to the ceiling', 'Hips stay up'] },

  // Core: back
  birddog: { n: 'Bird Dog', t: 'r', d: 5, s: true, tempo: 8, q: 'McGill bird dog', w: 'One of McGill\'s "Big 3" and the Army "quadraplex". It builds back endurance while the spine stays neutral.', c: ['Hands and knees, pad under your knees', 'Reach the opposite arm and leg out long. Not high', 'Hold 6–8 seconds with hips level', 'McGill tip: make a fist and tense the arm'] },
  birddogcrunch: { n: 'Bird Dog Elbow-to-Knee', t: 'r', d: 8, s: true, c: ['Extend the opposite arm and leg', 'Bring elbow and knee together under you', 'Extend again, slow and controlled'] },
  plankarmleg: { n: 'Plank Arm-Leg Lift', t: 'r', d: 6, s: true, b: 1, c: ['High plank', 'Lift the opposite arm and leg', "Hold 2 seconds, don't twist"] },

  // Conditioning
  stepjacks: { n: 'Step Jacks', t: 's', d: 30, q: 'low impact jumping jacks', c: ['Step one foot out as your arms go overhead', 'Alternate sides at a quick rhythm', 'No jumping, easy on the knees'] },
  shadowbox: { n: 'Shadow Boxing', t: 's', d: 30, c: ['Light on your feet, hands up', 'Jab–cross combos, rotating from the hips', 'Keep moving and breathe out on punches'] },
  jacks: { n: 'Jumping Jacks', t: 's', d: 30, k: 1, c: ['Land softly on the balls of your feet', 'Arms all the way overhead', 'Steady rhythm'] },
  mtnclimb: { n: 'Mountain Climbers', t: 's', d: 30, k: 1, b: 1, c: ['Hands under shoulders, body straight', 'Drive knees toward your chest, alternating', 'Hands on a chair makes it easier'] },
  stepburpee: { n: 'Step-Back Burpee', t: 's', d: 30, k: 1, b: 1, q: 'no jump burpee', c: ['Squat down, hands to the floor', 'Step back to a plank one foot at a time', 'Step back in and stand tall', 'No jumping'] },
  burpee: { n: 'Burpee', t: 's', d: 30, k: 2, b: 1, c: ['Squat, kick back to a plank', 'Jump the feet in', 'Jump up with arms overhead', 'Land softly'] },
};

// ---------- Progression ladders (easiest → hardest) ----------

const FAMILIES = {
  push: { n: 'Push', ex: ['wallpush', 'inclinepush', 'kneepush', 'pushup', 'declinepush', 'archerpush'] },
  dip: { n: 'Triceps & Shoulders', ex: ['chairdipbent', 'chairdip', 'pikepush', 'dipneg', 'bardip'] },
  pull: { n: 'Pull', ex: ['ytw', 'bandrow', 'tablerow', 'deadhang', 'scappull', 'negpull', 'bandpull', 'chinup', 'pullup'] },
  squat: { n: 'Squat', fb: 'kneeiso', ex: ['sitstand', 'boxsquat', 'squat', 'temposquat', 'splitsquat', 'bulgarian', 'singlebox'] },
  lunge: { n: 'Single Leg', fb: 'hip', ex: ['stepup', 'suprevlunge', 'revlunge', 'stepdown', 'laterallunge', 'walklunge'] },
  hinge: { n: 'Hips & Glutes', ex: ['bridge', 'marchbridge', 'slbridge', 'hipthrust', 'slrdl', 'slhipthrust'] },
  kneeiso: { n: 'Knee Armor', ex: ['slr', 'highwallsit', 'tke', 'wallsit', 'spanish'] },
  hip: { n: 'Hip Stability', ex: ['clamshell', 'sidelegraise', 'bandwalk', 'sideplankleg'] },
  calf: { n: 'Calves', ex: ['calfraise', 'stepcalf', 'slcalf'] },
  front: { n: 'Core: Front', ex: ['curlup', 'deadbug', 'inclineplank', 'plank', 'shouldertaps', 'hollow', 'hangknee'] },
  side: { n: 'Core: Side', ex: ['sideplankknee', 'sideplank', 'sideplankreach'] },
  birddog: { n: 'Core: Back', ex: ['birddog', 'birddogcrunch', 'plankarmleg'] },
  cardio: { n: 'Conditioning', ex: ['march', 'stepjacks', 'shadowbox', 'jacks', 'mtnclimb', 'stepburpee', 'burpee'] },
};

// Conservative starting point for getting back into training.
const START_LEVELS = { push: 1, dip: 0, pull: 0, squat: 1, lunge: 0, hinge: 0, kneeiso: 0, hip: 0, calf: 0, front: 0, side: 0, birddog: 0, cardio: 1 };

// ---------- Workouts ----------
// X(id, dose): a specific exercise.  F(family, opts): the user's current level in a ladder.
// Ladders with fb fall back to that family when nothing in the ladder is safe today.
// opts: d (dose), scale (dose multiplier), timed (seconds of max quality reps)
// block: rounds, rest (between exercises), roundRest (between rounds), kind ('warm' | 'cool' are not boosted)

const X = (x, d, o = {}) => ({ x, d, ...o });
const F = (f, o = {}) => ({ f, ...o });

const PREP_QUICK = { n: 'Prep Drill', kind: 'warm', items: [X('march', 20), X('armcircles', 20), X('catcamel', 20), X('hinge', 8)] };
const PREP_FULL = { n: 'Prep Drill', kind: 'warm', items: [X('march', 30), X('armcircles', 30), X('catcamel', 30), X('hinge', 10), X('legswings', 15), X('sitstand', 8), X('stepjacks', 30)] };
const RECOVER_QUICK = { n: 'Recovery Drill', kind: 'cool', items: [X('hamstringstretch', 20), X('figure4', 20), X('crocbreath', 30)] };
const RECOVER_FULL = { n: 'Recovery Drill', kind: 'cool', items: [X('overheadpull', 20), X('chestwall', 20), X('hipflexor', 25), X('quadstretch', 20), X('hamstringstretch', 25), X('figure4', 25), X('calfstretch', 20), X('crocbreath', 45)] };

const WORKOUTS = [
  // Quick: 5–10 min
  { id: 'q-reveille', len: 'quick', n: 'Reveille', tag: 'Full body', desc: 'Army-style wake-up: a fast warm-up, then two rounds that hit everything.',
    blocks: [PREP_QUICK, { n: 'Circuit', rounds: 2, rest: 10, roundRest: 30, items: [F('squat', { scale: 0.8 }), F('push', { scale: 0.8 }), F('hinge', { scale: 0.8 }), F('birddog', { scale: 0.8 }), F('cardio', { d: 30 })] }] },
  { id: 'q-backarmor', len: 'quick', n: 'Back Armor', tag: 'Lower back', desc: "McGill's Big 3, the exercises spine researcher Dr. Stuart McGill uses to build a pain-resistant back. Good to do daily.",
    blocks: [{ n: 'Spine Prep', kind: 'warm', items: [X('catcamel', 40)] }, { n: 'Big 3', rounds: 2, rest: 10, roundRest: 20, items: [X('curlup', 5), F('side'), X('birddog', 5)] }, { n: 'Reset', kind: 'cool', items: [X('crocbreath', 45)] }] },
  { id: 'q-kneearmor', len: 'quick', n: 'Knee Armor', tag: 'Knee', desc: 'Builds the quads, glutes and calves that protect the knee. Slow, controlled and low impact.',
    blocks: [{ n: 'Warm-up', kind: 'warm', items: [X('march', 30), X('legswings', 15)] }, { n: 'Armor Circuit', rounds: 2, rest: 10, roundRest: 30, items: [F('kneeiso', { scale: 0.7 }), F('hip', { scale: 0.7 }), F('lunge', { scale: 0.75 }), F('hinge', { scale: 0.7 }), F('calf', { scale: 0.7 })] }] },
  { id: 'q-4core', len: 'quick', n: '4 for the Core', tag: 'Core', desc: 'The Army PRT core drill: bent-leg raise, side bridge, back bridge and quadraplex.',
    blocks: [{ n: 'Warm-up', kind: 'warm', items: [X('march', 30), X('catcamel', 30)] }, { n: '4 for the Core', rounds: 2, rest: 10, roundRest: 30, items: [X('bentlegraise', 30), F('side'), X('bridgehold', 30), X('birddog', 5)] }] },
  { id: 'q-burner', len: 'quick', n: 'Hotel Room Burner', tag: 'Conditioning', desc: '30 seconds on, 15 off. No equipment, no excuses.',
    blocks: [PREP_QUICK, { n: 'Burner', rounds: 2, rest: 15, roundRest: 30, items: [F('cardio', { d: 30 }), F('squat', { timed: 30 }), F('push', { timed: 30 }), F('cardio', { d: 30 }), F('hinge', { timed: 30 })] }] },
  { id: 'q-mobility', len: 'quick', n: 'Mobility Reset', tag: 'Recovery', desc: 'Gentle movement for sore days, desk breaks or after a long flight.',
    blocks: [{ n: 'Mobility', kind: 'cool', items: [X('catcamel', 30), X('openbook', 5), X('hipflexor', 25), X('hamstringstretch', 25), X('figure4', 25), X('chestwall', 20), X('crocbreath', 45)] }] },

  // Medium: 20–30 min
  { id: 'm-a', len: 'medium', n: 'Foundation A', tag: 'Push, pull & core', desc: 'Upper-body strength paired with the core work that protects your back.',
    blocks: [PREP_FULL, { n: 'Strength', rounds: 3, rest: 20, roundRest: 60, items: [F('push'), F('pull')] }, { n: 'Accessory', rounds: 2, rest: 15, roundRest: 45, items: [F('dip'), F('front'), F('side')] }, RECOVER_QUICK] },
  { id: 'm-b', len: 'medium', n: 'Foundation B', tag: 'Legs & knee armor', desc: 'Leg strength built carefully around the knee, with glutes to support the back.',
    blocks: [PREP_FULL, { n: 'Strength', rounds: 3, rest: 20, roundRest: 60, items: [F('squat'), F('hinge')] }, { n: 'Knee Armor', rounds: 2, rest: 15, roundRest: 45, items: [F('lunge'), F('kneeiso'), F('hip'), F('calf')] }, RECOVER_QUICK] },
  { id: 'm-c', len: 'medium', n: 'Foundation C', tag: 'PRT conditioning', desc: 'An Army PRT-style conditioning drill: full-body moves with short rests to build your engine.',
    blocks: [PREP_FULL, { n: 'Conditioning Drill', rounds: 3, rest: 15, roundRest: 60, items: [F('cardio', { d: 30 }), F('push'), F('squat'), F('pull'), F('cardio', { d: 30 }), F('birddog')] }, RECOVER_QUICK] },
  { id: 'm-total', len: 'medium', n: 'Total Body Circuit', tag: 'Full body', desc: 'One big circuit that hits everything. Works anywhere with whatever you have.',
    blocks: [PREP_QUICK, { n: 'Circuit', rounds: 3, rest: 15, roundRest: 60, items: [F('push'), F('squat'), F('pull'), F('lunge'), F('front'), F('cardio', { d: 30 })] }, RECOVER_QUICK] },

  // Long: 35–45 min
  { id: 'l-forge', len: 'long', n: 'Forge', tag: 'Full-body strength', desc: 'Strength block, accessory block and a conditioning finisher.',
    blocks: [PREP_FULL, { n: 'Strength', rounds: 3, rest: 20, roundRest: 75, items: [F('push'), F('squat'), F('pull'), F('hinge')] }, { n: 'Accessory', rounds: 2, rest: 15, roundRest: 45, items: [F('dip'), F('lunge'), F('side'), F('birddog')] }, { n: 'Finisher', rounds: 3, rest: 15, roundRest: 30, items: [F('cardio', { d: 30 }), F('front')] }, RECOVER_FULL] },
  { id: 'l-ruck', len: 'long', n: 'Ruck Day', tag: 'Legs, core & engine', desc: 'Heavy leg day, the Big 3 for your back, then intervals.',
    blocks: [PREP_FULL, { n: 'Legs', rounds: 3, rest: 20, roundRest: 60, items: [F('squat'), F('lunge'), F('hinge'), F('kneeiso')] }, { n: 'Big 3', rounds: 2, rest: 10, roundRest: 30, items: [X('curlup', 5), F('side'), X('birddog', 5)] }, { n: 'Intervals', rounds: 6, rest: 0, roundRest: 20, items: [F('cardio', { d: 40 })] }, RECOVER_FULL] },
  { id: 'l-prt', len: 'long', n: 'The Full PRT', tag: 'Army PRT session', desc: 'A complete Army-style session: Prep Drill, Conditioning Drill, 4 for the Core and Recovery Drill.',
    blocks: [PREP_FULL, { n: 'Conditioning Drill', rounds: 3, rest: 15, roundRest: 45, items: [F('cardio', { d: 30 }), F('push'), F('squat'), F('pull'), F('lunge'), F('cardio', { d: 30 })] }, { n: '4 for the Core', rounds: 1, rest: 10, items: [X('bentlegraise', 40), F('side'), X('bridgehold', 40), X('birddog', 5)] }, RECOVER_FULL] },
];

// ---------- 8-week program ----------

const PHASES = [
  { n: 'Foundation', weeks: 3, days: ['m-a', 'm-b', 'm-c'], boost: 0, desc: 'Learn the movements, wake up the back and knee, build the habit.' },
  { n: 'Build', weeks: 3, days: ['m-a', 'm-b', 'm-c'], boost: 1, desc: 'Same sessions with an extra round on every main block.' },
  { n: 'Forge', weeks: 2, days: ['l-forge', 'l-ruck', 'l-prt'], boost: 0, desc: 'Full-length sessions. Bring everything together.' },
];
