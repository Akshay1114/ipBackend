// const tf = require("@tensorflow/tfjs-node");
import tf from "@tensorflow/tfjs-node";

// const trainingData = tf.tensor2d([
//     [8, 10, 1], [7, 8, 1], [6, 5, 1],  // Assigned flights
//     [5, 3, 0], [4, 2, 0]               // Not assigned due to low sleep
//   ]);
  
//   const outputData = tf.tensor2d([[1], [1], [1], [0], [0]]);
  
//   const model = tf.sequential();
//   model.add(tf.layers.dense({ inputShape: [3], units: 8, activation: "relu" }));
//   model.add(tf.layers.dense({ units: 1, activation: "sigmoid" }));
  
//   model.compile({ optimizer: "adam", loss: "binaryCrossentropy", metrics: ["accuracy"] });
  
//   async function trainModel() {
//     await model.fit(trainingData, outputData, { epochs: 100 });
//     console.log("✅ AI Model Trained!");
//   }
  
//   // Predict if a pilot gets assigned a flight
//   async function predictSchedule(sleepHours, experience) {
//     const input = tf.tensor2d([[sleepHours, experience, 1]]);
//     const prediction = model.predict(input);
//     const result = (await prediction.data())[0];
//     return result > 0.5;
//   }

let model = null;

// ✅ Ensure the model is trained before predictions
async function trainModel(trainingData) {
  const xs = trainingData.map((d) => [d.sleepHours, d.experienceLevel, d.qualificationLevel]);
  const ys = trainingData.map((d) => (d.flightAssigned ? 1 : 0));

  const inputTensor = tf.tensor2d(xs, [xs.length, 3]);
  const outputTensor = tf.tensor2d(ys, [ys.length, 1]);

  model = tf.sequential();
  model.add(tf.layers.dense({ units: 8, inputShape: [3], activation: "relu" }));
  model.add(tf.layers.dense({ units: 4, activation: "relu" }));
  model.add(tf.layers.dense({ units: 1, activation: "sigmoid" }));

  model.compile({ optimizer: "adam", loss: "binaryCrossentropy", metrics: ["accuracy"] });

  await model.fit(inputTensor, outputTensor, { 
    epochs: 50, 
    verbose: 0 // ✅ This disables the progress bar that causes the error
  });

  console.log("✅ AI Model Training Completed");
}

async function predictSchedule(pilot) {
  // ✅ Ensure model is trained
  if (!model) {
    throw new Error("❌ AI Model is not trained. Train the model first using /train");
  }

  if (pilot.sleepHours < 6) {
    return { assigned: false, warning: "⚠️ Insufficient Sleep" };
  }

  const input = tf.tensor2d([[pilot.sleepHours, pilot.experienceLevel, pilot.qualificationLevel]]);
  const prediction = model.predict(input);
  const assigned = (await prediction.data())[0] > 0.5;

  return { assigned, warning: assigned ? null : "⚠️ No flight available" };
}
// let model = null;

// // Dummy training data
// const trainingData = [
//   { sleepHours: 8, experienceLevel: 3, qualificationLevel: 2, flightAssigned: true },
//   { sleepHours: 5, experienceLevel: 1, qualificationLevel: 1, flightAssigned: false },
//   { sleepHours: 7, experienceLevel: 2, qualificationLevel: 1, flightAssigned: true },
// ];

// async function trainModel(trainingData) {
//   const xs = trainingData.map((d) => [d.sleepHours, d.experienceLevel, d.qualificationLevel]);
//   const ys = trainingData.map((d) => (d.flightAssigned ? 1 : 0));

//   const inputTensor = tf.tensor2d(xs, [xs.length, 3]);
//   const outputTensor = tf.tensor2d(ys, [ys.length, 1]);

//   model = tf.sequential();
//   model.add(tf.layers.dense({ units: 8, inputShape: [3], activation: 'relu' }));
//   model.add(tf.layers.dense({ units: 4, activation: 'relu' }));
//   model.add(tf.layers.dense({ units: 1, activation: 'sigmoid' }));

//   model.compile({ optimizer: 'adam', loss: 'binaryCrossentropy', metrics: ['accuracy'] });

//   await model.fit(inputTensor, outputTensor, { epochs: 50, verbose: 0 });
//   console.log('AI Model Training Completed');
// }

// async function predictFlightAssignment(pilot) {
//   if (!model) {
//     throw new Error('AI Model is not trained. Train the model first');
//   }

//   const input = tf.tensor2d([[pilot.sleepHours, pilot.experienceLevel, pilot.qualificationLevel]]);
//   const prediction = model.predict(input);
//   const assigned = (await prediction.data())[0] > 0.5;

//   return { assigned, warning: assigned ? null : '⚠️ No flight available' };
// }

export { trainModel, predictSchedule };
