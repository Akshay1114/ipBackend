import {Schedule} from "../models/schedule.js";
import moment from "moment";

const shuffleArray = (array) => array.sort(() => Math.random() - 0.5);
let model = null;

// Load AI Model

// const flights = [
//     { name: 'Flight 101', duration: 4, start: '08:00', end: '12:00', qualification: 'ATPL' },
//     { name: 'Flight 202', duration: 3, start: '10:00', end: '13:00', qualification: 'CPL' },
//     { name: 'Flight 303', duration: 5, start: '14:00', end: '19:00', qualification: 'ATPL' },
//     { name: 'Flight 404', duration: 6, start: '16:00', end: '22:00', qualification: 'CPL' },
//     { name: 'Flight 505', duration: 2, start: '20:00', end: '22:00', qualification: 'ATPL' },
//   ];

// const flights = ["Flight 101", "Flight 202", "Flight 303"];
const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

// const flights = [
//     { flightName: "AI-101", flightDay: "Monday", startTime: "06:00 AM", endTime: "10:00 AM" },
//     { flightName: "LH-202", flightDay: "Wednesday", startTime: "12:00 PM", endTime: "04:00 PM" },
//     { flightName: "BA-303", flightDay: "Friday", startTime: "08:00 PM", endTime: "12:00 AM" }
//   ];

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

const flights = [
    {
      flightName: 'Flight A101',
      startTime: new Date('2025-03-01T06:30:00Z'),
      endTime: new Date('2025-03-01T08:30:00Z'),
      flightDuration: 2,
    },
    {
      flightName: 'Flight B202',
      startTime: new Date('2025-03-01T09:15:00Z'),
      endTime: new Date('2025-03-01T11:00:00Z'),
      flightDuration: 1.75,
    },
    {
      flightName: 'Flight C303',
      startTime: new Date('2025-03-01T12:00:00Z'),
      endTime: new Date('2025-03-01T14:00:00Z'),
      flightDuration: 2,
    },
    {
      flightName: 'Flight D404',
      startTime: new Date('2025-03-01T15:30:00Z'),
      endTime: new Date('2025-03-01T17:30:00Z'),
      flightDuration: 2,
    },
  ];
  
  // FDTL rules for maximum working hours
  const FDTL = {
    dailyLimit: 8, // Maximum hours a pilot can work in a day
    weeklyLimit: 40, // Maximum hours a pilot can work in a week
  };
  
  // Function to generate schedule for a pilot
  async function generatePilotSchedule(pilot) {
    let totalFlightHoursToday = 0;
    let totalFlightHoursThisWeek = 0;
    
    let flightsForSchedule = [];
  
    for (let flight of flights) {
      // Check if the pilot has had enough sleep before scheduling
      const sleepSufficient = pilot.sleepData.lastSleepDuration >= 7; // Minimum 7 hours sleep for safety
      if (!sleepSufficient) {
        console.log(`Pilot ${pilot.name} has insufficient sleep. Skipping flight ${flight.flightName}.`);
        continue; // Skip this flight if sleep is insufficient
      }
  
      // Ensure the daily and weekly limits aren't exceeded
      totalFlightHoursToday += flight.flightDuration;
      totalFlightHoursThisWeek += flight.flightDuration;
  
      if (totalFlightHoursToday <= FDTL.dailyLimit && totalFlightHoursThisWeek <= FDTL.weeklyLimit) {
        flightsForSchedule.push({
          flightName: flight.flightName,
          startTime: flight.startTime,
          endTime: flight.endTime,
          flightDuration: flight.flightDuration,
          isSleepSufficient: sleepSufficient,
          FDTLLimitExceeded: false,
        });
      } else {
        console.log(`Pilot ${pilot.name} has exceeded FDTL limits. Skipping flight ${flight.flightName}.`);
        break; // Stop scheduling more flights for this pilot
      }
    }
  
    return flightsForSchedule;
  }

  const FDTL_LIMITS = {
    ATPL: 12,
    CPL: 10,
    PPL: 8,
  };
  function getCurrentWeekNumber() {
    const currentDate = new Date();
    const startDate = new Date(currentDate.getFullYear(), 0, 1);
    const diffInTime = currentDate - startDate;
    return Math.ceil(diffInTime / (1000 * 3600 * 24 * 7));
  }
  
  const saveSchedule = async (payload = {}) => {
    const pilots = [
        {
          employee_ID: 'P001',
          name: 'John Doe',
          qualification: 'ATPL',
          sleepData: {
            lastSleepDuration: 8,
            lastSleepDate: new Date('2025-02-28T22:00:00Z'),
          },
          preferences: {
            availableDays: ['Monday', 'Tuesday', 'Saturday', 'Sunday'],
          },
          week: 1,
          isScheduleComplete: false,
        },
        {
          employee_ID: 'P002',
          name: 'Jane Smith',
          qualification: 'CPL',
          sleepData: {
            lastSleepDuration: 7,
            lastSleepDate: new Date('2025-02-28T23:00:00Z'),
          },
          preferences: {
            availableDays: ['Monday', 'Tuesday', 'Sunday'],
          },
          week: 1,
          isScheduleComplete: false,
        },
        {
          employee_ID: 'P003',
          name: 'Alice Johnson',
          qualification: 'PPL',
          sleepData: {
            lastSleepDuration: 6,
            lastSleepDate: new Date('2025-02-28T20:00:00Z'),
          },
          preferences: {
            availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
          },
          week: 1,
          isScheduleComplete: false,
        },
        {
          employee_ID: 'P004',
          name: 'Michael Brown',
          qualification: 'ATPL',
          sleepData: {
            lastSleepDuration: 9,
            lastSleepDate: new Date('2025-02-28T21:00:00Z'),
          },
          preferences: {
            availableDays: ['Monday', 'Friday', 'Saturday'],
          },
          week: 1,
          isScheduleComplete: false,
        },
        {
          employee_ID: 'P005',
          name: 'Emily White',
          qualification: 'CPL',
          sleepData: {
            lastSleepDuration: 5,
            lastSleepDate: new Date('2025-02-28T19:00:00Z'),
          },
          preferences: {
            availableDays: ['Tuesday', 'Wednesday', 'Thursday'],
          },
          week: 1,
          isScheduleComplete: false,
        },
      ];
    
      const assignedFlights = []; // Array to store all assigned flight times
    
      // Define FDTL limits
      const maxFDTL = {
        ATPL: 12,
        CPL: 10,
        PPL: 8,
      };
    
      // Define max flight hours per week
      const maxWeeklyFlights = {
        ATPL: 70,
        CPL: 50,
        PPL: 30,
      };
    
      // Define max number of flights per week
      const maxFlightsPerWeek = {
        ATPL: 5,
        CPL: 4,
        PPL: 3,
      };
    
      // Define minimum rest time between flights
      const minRestTime = 10;
    
      // Loop through each pilot
      for (let pilot of pilots) {
        console.log(`Generating schedule for ${pilot.name}...`);
    
        const availableDays = pilot.preferences.availableDays;
        const pilotFDTL = maxFDTL[pilot.qualification];
        const weeklyLimit = maxWeeklyFlights[pilot.qualification];
        const maxFlights = maxFlightsPerWeek[pilot.qualification];
    
        const sleepDuration = pilot.sleepData.lastSleepDuration;
        let sleepWarning = null;
    
        // If sleep is insufficient, skip flight assignment
        if (sleepDuration < 8) {
          sleepWarning = `Pilot ${pilot.name} has insufficient sleep (${sleepDuration} hours), no flights assigned.`;
          console.log(sleepWarning);
        }
    
        // Flight durations for realism (between 2 and 5 hours per flight)
        const flightDurations = [2, 3, 4, 5];
    
        let totalFlightHours = 0;
        const flights = [];
        let flightCounter = 0;
    
        let lastEndTime = new Date(pilot.sleepData.lastSleepDate); // Start with the pilot's last sleep time
    
        // If sleep is insufficient, skip flight assignment
        if (sleepDuration < 8) {
          const schedule = new Schedule({
            employee_ID: pilot.employee_ID,
            name: pilot.name,
            qualification: pilot.qualification,
            sleepData: pilot.sleepData,
            preferences: pilot.preferences,
            flights: [], // No flights assigned
            week: 1,
            isScheduleComplete: true,
            sleepWarning: sleepWarning || null,
          });
    
          console.log(`Saving schedule for ${pilot.name} with insufficient sleep...`);
          try {
            await schedule.save();
            console.log(`Schedule saved for ${pilot.name} with warning`);
          } catch (error) {
            console.error(`Error saving schedule for ${pilot.name}:`, error);
          }
          continue; // Skip to the next pilot
        }
    
        // Loop until we reach maxFlights or weekly limit
        while (flightCounter < maxFlights && totalFlightHours < weeklyLimit) {
          const randomDay = availableDays[Math.floor(Math.random() * availableDays.length)];
    
          const flightDuration = flightDurations[Math.floor(Math.random() * flightDurations.length)];
    
          // Check if adding this flight would exceed weekly hours
          if (totalFlightHours + flightDuration > weeklyLimit) break;
    
          // Calculate the start time for this flight
          const startTime = new Date(lastEndTime);
          startTime.setHours(startTime.getHours() + minRestTime + Math.floor(Math.random() * 4) + 1);
    
          if (startTime.getHours() < 9) {
            startTime.setHours(9);
          } else if (startTime.getHours() > 18) {
            startTime.setHours(18);
          }
    
          const endTime = new Date(startTime.getTime() + flightDuration * 60 * 60 * 1000);
    
          // Check for conflicts with already assigned flights
          const conflict = assignedFlights.some(flight => {
            return flight.startTime <= endTime && flight.endTime >= startTime;
          });
    
          if (!conflict) {
            flights.push({
              flightName: `Flight-${flightCounter + 1}`,
              startTime: startTime,
              endTime: endTime,
              flightDuration: flightDuration,
              isSleepSufficient: sleepDuration >= 8,
              FDTLLimitExceeded: flightDuration > pilotFDTL,
            });
    
            assignedFlights.push({ startTime, endTime });
            totalFlightHours += flightDuration;
            flightCounter++;
            lastEndTime = endTime;
          }
        }
    
        // Save the generated schedule for the pilot
        const schedule = new Schedule({
          employee_ID: pilot.employee_ID,
          name: pilot.name,
          qualification: pilot.qualification,
          sleepData: pilot.sleepData,
          preferences: pilot.preferences,
          flights: flights,
          week: 1,
          isScheduleComplete: true,
          sleepWarning: sleepWarning || null,
        });
    
        console.log(`Saving schedule for ${pilot.name}...`);
        try {
          await schedule.save();
          console.log(`Schedule saved for ${pilot.name}`);
        } catch (error) {
          console.error(`Error saving schedule for ${pilot.name}:`, error);
        }
      }
    
      return 'All schedules have been saved.';
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