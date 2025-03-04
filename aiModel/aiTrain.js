// const tf = require("@tensorflow/tfjs-node");
import tf from "@tensorflow/tfjs-node";
import { Schedule } from "../models/schedule.js";

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

// let model = null;

// // ✅ Ensure the model is trained before predictions
// async function trainModel(trainingData) {
//   const xs = trainingData.map((d) => [d.sleepHours, d.experienceLevel, d.qualificationLevel]);
//   const ys = trainingData.map((d) => (d.flightAssigned ? 1 : 0));

//   const inputTensor = tf.tensor2d(xs, [xs.length, 3]);
//   const outputTensor = tf.tensor2d(ys, [ys.length, 1]);

//   model = tf.sequential();
//   model.add(tf.layers.dense({ units: 8, inputShape: [3], activation: "relu" }));
//   model.add(tf.layers.dense({ units: 4, activation: "relu" }));
//   model.add(tf.layers.dense({ units: 1, activation: "sigmoid" }));

//   model.compile({ optimizer: "adam", loss: "binaryCrossentropy", metrics: ["accuracy"] });

//   await model.fit(inputTensor, outputTensor, { 
//     epochs: 50, 
//     verbose: 0 // ✅ This disables the progress bar that causes the error
//   });

//   console.log("✅ AI Model Training Completed");
// }

// async function predictSchedule(pilot) {
//   // ✅ Ensure model is trained
//   if (!model) {
//     throw new Error("❌ AI Model is not trained. Train the model first using /train");
//   }

//   if (pilot.sleepHours < 6) {
//     return { assigned: false, warning: "⚠️ Insufficient Sleep" };
//   }

//   const input = tf.tensor2d([[pilot.sleepHours, pilot.experienceLevel, pilot.qualificationLevel]]);
//   const prediction = model.predict(input);
//   const assigned = (await prediction.data())[0] > 0.5;

//   return { assigned, warning: assigned ? null : "⚠️ No flight available" };
// }
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







const pilots = [
    {
      employee_ID: '123', // pilot 1
      name: 'John Doe',
      qualification: 'ATPL',
      lastSleepDuration: 8,
      lastSleepDate: new Date(),
    },
    {
      employee_ID: '124', // pilot 2
      name: 'Jane Smith',
      qualification: 'CPL',
      lastSleepDuration: 7,
      lastSleepDate: new Date(),
    },
    {
      employee_ID: '125', // pilot 3
      name: 'Alice Johnson',
      qualification: 'PPL',
      lastSleepDuration: 6,
      lastSleepDate: new Date(),
    },
    {
      employee_ID: '126', // pilot 4
      name: 'Bob Lee',
      qualification: 'ATPL',
      lastSleepDuration: 8,
      lastSleepDate: new Date(),
    },
  ];

const MAX_HOURS_PER_DAY = 8;
const MIN_SLEEP_HOURS = 7;

// Convert qualifications to numerical values
const QUALIFICATIONS = { ATPL: 3, CPL: 2, PPL: 1 };

// Function to preprocess schedule data for AI training
async function preprocessData() {
    const schedules = await Schedule.find();
    // const pilots = await Pilot.find();

    const trainingData = [];
    const labels = [];

    for (const schedule of schedules) {
        const pilot = pilots.find(p => p.employee_ID === schedule.employee_ID);
        if (!pilot) continue;

        schedule.flights.forEach(flight => {
            trainingData.push([
                QUALIFICATIONS[pilot.qualification],  // Pilot qualification
                pilot.lastSleepDuration,              // Sleep hours
                schedule.flights.length,              // Number of flights assigned
            ]);

            labels.push(flight.duration); // Predict flight duration
        });
    }

    return { trainingData, labels };
}

// Train AI model to predict flight duration based on past data
async function trainModel() {
    console.log("Starting AI Training...");
        const { trainingData, labels } = await preprocessData();

        if (trainingData.length === 0) throw new Error("Training data is empty!");

        const xs = tf.tensor2d(trainingData, [trainingData.length, 3]);
        const ys = tf.tensor1d(labels);

        const model = tf.sequential();
        model.add(tf.layers.dense({ inputShape: [3], units: 16, activation: 'relu' }));
        model.add(tf.layers.dense({ units: 8, activation: 'relu' }));
        model.add(tf.layers.dense({ units: 1 })); // Predict flight duration

        model.compile({ optimizer: 'adam', loss: 'meanSquaredError' });

        await model.fit(xs, ys, { epochs: 50 });

        console.log("Model Training Completed!");
        return model;
}


// Generate AI-powered schedule
async function generateAISchedule(week) {
    console.log("Generating AI Schedule for Week", week);
    console.log("PILOTSSSSSS")
    console.log(pilots)
    const model = await trainModel();
    // const pilots = await Pilot.find();
console.log("Model:", model);
    let availableFlights = [
        { flightName: 'Flight A', startTime: '08:00' },
        { flightName: 'Flight B', startTime: '14:00' },
        { flightName: 'Flight C', startTime: '09:00' },
        { flightName: 'Flight D', startTime: '11:00' },
        { flightName: 'Flight E', startTime: '10:00' },
    ];

    const newSchedule = [];
console.log("Pilots:", pilots);
    for (const pilot of pilots) {
        console.log("Assigning Schedule for Pilot:", pilot.name);
        let totalFlightHours = 0;
        let pilotFlights = [];

        for (const flight of availableFlights) {
            console.log("Assigning Flight to Pilot:", pilot.name, flight.flightName);
            const inputValues = [
                QUALIFICATIONS[pilot.qualification] || 0,  // Default to 0 if undefined
                pilot.lastSleepDuration || 0,  
                pilotFlights.length || 0
            ];
            
            console.log("Input values:", inputValues);
            
            const inputTensor = tf.tensor2d(
                [inputValues], // Ensure 2D format
                [1, inputValues.length] // Shape: 1 row, 3 columns
            );
            
            const predictedDuration = model.predict(inputTensor).dataSync()[0];
            
            console.log("Predicted Flight Duration:", predictedDuration);
            
            if (predictedDuration > 0 && totalFlightHours + predictedDuration <= MAX_HOURS_PER_DAY) {
                pilotFlights.push({
                    flightName: flight.flightName,
                    startTime: flight.startTime,
                    duration: Math.round(predictedDuration),
                    isSleepSufficient: pilot.lastSleepDuration >= MIN_SLEEP_HOURS
                });

                totalFlightHours += predictedDuration;
            }
        }

        newSchedule.push({
            employee_ID: pilot.employee_ID,
            name: pilot.name,
            qualification: pilot.qualification,
            flights: pilotFlights,
        });
    }

    await Schedule.insertMany(newSchedule);
    return newSchedule;
}
export { generateAISchedule };
