import {Schedule} from "../models/schedule.js";
import moment from "moment";
import {predictSchedule, trainModel} from "../aiModel/aiTrain.js"
import tf from "@tensorflow/tfjs-node";

const shuffleArray = (array) => array.sort(() => Math.random() - 0.5);
let model = null;

// Load AI Model
const loadModel = async () => {
  if (!model) {
    model = await tf.loadLayersModel("file://./model/model.json");
    console.log("✅ AI Model Loaded");
  }
}
// const flights = [
//     { name: 'Flight 101', duration: 4, start: '08:00', end: '12:00', qualification: 'ATPL' },
//     { name: 'Flight 202', duration: 3, start: '10:00', end: '13:00', qualification: 'CPL' },
//     { name: 'Flight 303', duration: 5, start: '14:00', end: '19:00', qualification: 'ATPL' },
//     { name: 'Flight 404', duration: 6, start: '16:00', end: '22:00', qualification: 'CPL' },
//     { name: 'Flight 505', duration: 2, start: '20:00', end: '22:00', qualification: 'ATPL' },
//   ];

// const flights = ["Flight 101", "Flight 202", "Flight 303"];
const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const flights = [
    { flightName: "AI-101", flightDay: "Monday", startTime: "06:00 AM", endTime: "10:00 AM" },
    { flightName: "LH-202", flightDay: "Wednesday", startTime: "12:00 PM", endTime: "04:00 PM" },
    { flightName: "BA-303", flightDay: "Friday", startTime: "08:00 PM", endTime: "12:00 AM" }
  ];

const getFlightTimes = () => {
  const startHour = Math.floor(Math.random() * 12) + 6; // Between 6 AM and 6 PM
  const startMinute = Math.random() < 0.5 ? "00" : "30";
  const duration = Math.floor(Math.random() * 5) + 2; // 2 to 6 hours
  const endHour = startHour + duration;

  return {
    startTime: `${startHour}:${startMinute} AM`,
    endTime: `${endHour}:${startMinute} PM`
  };
};

const generateSchedule = async (pilot) => {
    await loadModel();

    if (pilot.sleepHours < 6) {
      return { assigned: false, warning: "⚠️ Insufficient Sleep" };
    }
  
    // Filter flights based on pilot qualification
    const availableFlights = flights.filter((flight) => {
      return flight.qualification === pilot.qualification;
    });
  
    // Ensure there are available flights for the pilot
    if (availableFlights.length === 0) {
      return { assigned: false, warning: "⚠️ No flights available for your qualification" };
    }
  
    // Assign a flight randomly from the available options
    const randomFlight = availableFlights[Math.floor(Math.random() * availableFlights.length)];
  
    return {
      assigned: true,
      flightName: randomFlight.name,
      flightDay: "Monday", // You can customize the day assignment logic
      flightStartTime: randomFlight.start,
      flightEndTime: randomFlight.end,
      warning: null,
    };
  };
  
  const saveSchedule = async (payload = {}) => {
    try {
        const { weeks } = payload;
        // const pilots = await Schedule.find();
        const pilots = [
            {
              employee_ID: "123456",
              name: "Captain John",
              experience: "Senior",
              qualification: "ATPL",
              sleepHours: 7
            },
            {
              employee_ID: "111111",
              name: "Pilot Jane",
              experience: "Junior",
              qualification: "CPL",
              sleepHours: 5
            },
            {
              employee_ID: "222333",
              name: "Pilot Alex",
              experience: "Expert",
              qualification: "PPL",
              sleepHours: 8
            }
          
          ];

        const flights = [
            { flight_name: "AA123", required_experience: 3, required_qualification: "CPL", duration: 5 },
            { flight_name: "BA456", required_experience: 1, required_qualification: "CPL", duration: 4 },
            { flight_name: "CA789", required_experience: 2, required_qualification: "CPL", duration: 6 },
            { flight_name: "DA567", required_experience: 5, required_qualification: "ATPL", duration: 7 },
            { flight_name: "EA678", required_experience: 6, required_qualification: "ATPL", duration: 8 }
        ];

        const pilotData = pilots.map(p => [p.experience, p.sleepHours, p.maxWeeklyHours]);
        const inputTensor = tf.tensor2d(pilotData);

        const model = tf.sequential();
        model.add(tf.layers.dense({ units: 4, inputShape: [3], activation: 'relu' }));
        model.add(tf.layers.dense({ units: flights.length, activation: 'softmax' }));
        model.compile({ optimizer: 'adam', loss: 'categoricalCrossentropy' });

        const output = model.predict(inputTensor);
        const predictions = output.arraySync();

        for (let week = 1; week <= weeks; week++) {
            let schedule = pilots.map((pilot, index) => {
                let assignedFlight = flights.find(flight =>
                    pilot.experience >= flight.required_experience &&
                    pilot.qualification === flight.required_qualification
                );

                if (!assignedFlight) {
                    return { ...pilot._doc, schedules: [], warning: "⚠️ No suitable flights available" };
                }

                let start_time = moment().add(week * 7, 'days').set({ hour: 8, minute: 0 });
                let end_time = start_time.clone().add(assignedFlight.duration, 'hours');

                return {
                    employee_ID: pilot.employee_ID,
                    name: pilot.name,
                    schedules: [{
                        week,
                        flights: [{
                            flight_name: assignedFlight.flight_name,
                            required_experience: assignedFlight.required_experience,
                            required_qualification: assignedFlight.required_qualification,
                            duration: assignedFlight.duration,
                            start_time: start_time.toISOString(),
                            end_time: end_time.toISOString(),
                            assigned: true,
                            warning: pilot.sleepHours < 6 ? `⚠️ Low Sleep: ${pilot.sleepHours} hours` : null
                        }]
                    }]
                };
            });

            for (let pilot of schedule) {
                await Schedule.findOneAndUpdate(
                    { employee_ID: pilot.employee_ID },
                    { $push: { schedules: { $each: pilot.schedules } } },
                    { new: true }
                );
            }
        }

        return "AI-generated multi-week schedule created!"

        // res.json({ message: "AI-generated multi-week schedule created!" });
    } catch (error) {
        // res.status(500).json({ error: error.message });
        return error.message;
    }
};


// const saveSchedule = async (payload = {}) => {
//     try{
//         // const { pilots } = req.body;
//         const { employees, weekStartDate } = payload;
//         if (!employees || employees.length === 0) {
//             return res.status(400).json({ message: "❌ No pilot data provided" });
//           }
      
//           let schedules = [];
      
//           for (let pilot of employees) {
            
//             const experienceLevel = pilot.experience === "Senior" ? 1 : (pilot.experience === "Expert" ? 2 : 0);
//             const qualificationLevel = pilot.qualification === "ATPL" ? 3 :
//                                       (pilot.qualification === "CPL" ? 2 : (pilot.qualification === "PPL" ? 1 : 0));
      
//             const { assigned, warning } = await predictSchedule({
//               sleepHours: pilot.sleepHours,
//               experienceLevel,
//               qualificationLevel
//             });
      
//             let flightDetails = null;
      
            
//             if (assigned) {
//               flightDetails = flights[Math.floor(Math.random() * flights.length)];
//             }
      
           
//             const schedule = new Schedule({
//               employee_ID: pilot.employee_ID,
//               name: pilot.name,
//               weekStartDate,
//               flightAssigned: assigned,
//               flightName: assigned ? flightDetails.flightName : null,
//               flightDay: assigned ? flightDetails.flightDay : null,
//               flightStartTime: assigned ? flightDetails.startTime : null,
//               flightEndTime: assigned ? flightDetails.endTime : null,
//               experience: pilot.experience,
//               qualification: pilot.qualification,
//               sleepHours: pilot.sleepHours,
//               warning: warning
//             });
      
//             await schedule.save();
//             schedules.push(schedule);
//           }
//         return schedules;

//         // NEWWW
//     //     const pilots = await Schedule.find({});
//     //     const weekStartDate = new Date();
    
//     //     const updatedSchedules = await Promise.all(
//     //       pilots.map(async (pilot) => {
//     //         const schedule = await generateSchedule(pilot);
    
//     //         return Schedule.findOneAndUpdate(
//     //           { employee_ID: pilot.employee_ID },
//     //           {
//     //             weekStartDate,
//     //             flightAssigned: schedule.assigned,
//     //             flightName: schedule.flightName || null,
//     //             flightDay: schedule.flightDay || null,
//     //             flightStartTime: schedule.flightStartTime || null,
//     //             flightEndTime: schedule.flightEndTime || null,
//     //             warning: schedule.warning || null,
//     //           },
//     //           { new: true }
//     //         );
//     //       })
//     //     );
//     // return updatedSchedules;
//         // res.json(schedules);
//         // res.status(201).json({ message: "✅ Schedule saved successfully!" });
//     }catch(error){
//         throw new Error(error.message)
//     }
// }
// const saveSchedule = async (payload = {}) => {
//     try{
//         console.log('payload', payload)
//         const { schedule, warnings } = payload;
    
//         if (!schedule) {
//           throw new Error("Invalid request data");
//         }
    
//         for (const entry of schedule) {
//           const weekStartDate = moment().startOf("isoWeek").toDate(); // Monday of current week
//             console.log('weekStartDate',  entry.flightStart)
//           await Schedule.create({
//             employee_ID: entry.employee_ID,
//             name: entry.name,
//             weekStartDate,
//             flightStart:  entry.flightStart, 
//             flightEnd:  entry.flightEnd,
//             experience: entry.experience,
//             qualification: entry.qualification,
//             warning: entry.warnings
//           });
//         }
//         return "Schedule saved successfully!";
//         // res.status(201).json({ message: "✅ Schedule saved successfully!" });
//     }catch(error){
//         throw new Error(error.message)
//     }
// }

const getScheduleById = async (search = {}) => {
    try{
        console.log('search', search)
        const { employee_ID } = search;
        const schedule = await Schedule
        .findOne(employee_ID)
        .exec();
        return schedule;
    }
    catch(error){
        throw new Error(error.message)
    }
}
const getAllSchedule = async (search = {}) => {
    try{
        const schedule = await Schedule
        .find()
        return schedule;
    }
    catch(error){
        throw new Error(error.message)
    }
}

export { saveSchedule, getScheduleById, getAllSchedule };