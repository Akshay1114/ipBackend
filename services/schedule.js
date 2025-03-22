import FlightSchedule from "../models/flightSchedule.js";
import { User } from "../models/index.js";
import {Schedule} from "../models/schedule.js";
import moment from "moment";

const MAX_DUTY_HOURS = 10; // Max hours a crew can work in one day
const MIN_REST_PERIOD = 8 * 60 * 60 * 1000;

async function updateCrewHealthMetrics(crewId, fatigueLevel, sleepHours) {
  const updatedCrew = await User.findOneAndUpdate(
    { crewId: crewId },
    { 
      $set: { 
        "healthMetrics.fatigueLevel": fatigueLevel,
        "healthMetrics.sleepHours": sleepHours
      }
    },
    { new: true }
  );
  console.log("Updated Crew:", updatedCrew);
}

const flightCategory = (duration) => {
  if (duration <= 3) return "Short-haul";
  if (duration <= 6) return "Mid-haul";
  return "Long-haul";
};

const requiredCrew = (category) => {
  if (category === "Short-haul") return { pilots: 2, cabinCrew: 4 };
  if (category === "Mid-haul") return { pilots: 2, cabinCrew: 6 };
  return { pilots: 2, cabinCrew: 8 }; // Long-haul
};

const getShift = (departureTime) => {
  const hour = new Date(departureTime).getHours();
  if (hour >= 6 && hour < 12) return "Morning";
  if (hour >= 12 && hour < 18) return "Afternoon";
  return "Night";
};

const getRequiredCertification = (flight) => {
  // Example logic to fetch required certifications
  return flight.category === "Long-haul" ? "Airbus A380" : "Boeing 737";
};

const isCrewEligible = (crew, flight, crewRestTimes, crewDutyHours) => {
  const flightDeparture = new Date(flight.departure);
  const flightArrival = new Date(flight.arrival);
  const flightDuration = (flightArrival - flightDeparture) / (60 * 60 * 1000); // in hours

  return (
    (!crewRestTimes[crew.crewId] || crewRestTimes[crew.crewId] + MIN_REST_PERIOD <= flightDeparture.getTime()) &&
    (crewDutyHours[crew.crewId] || 0) + flightDuration <= MAX_DUTY_HOURS &&
    crew.healthMetrics.fatigueLevel < 5 &&
    crew.healthMetrics.sleepHours >= 6 &&
    crew.healthMetrics.heartRate <= 80 &&
    crew.preferredShifts.includes(getShift(flight.departure)) &&
    (!crew.preferredRoutes.length || crew.preferredRoutes.includes(flight.flightId)) &&
    !crew.unavailableDates.some(date => date.toDateString() === flightDeparture.toDateString())
  );
};

async function scheduleCrew() {
  try {
    const crews = await Crew.find();
    const flights = await Flight.find().sort({ departure: 1 }); // Sort flights by departure time

    const schedules = [];
    const crewAvailability = {}; // Keep track of when each crew member is available
    const crewDutyHours = {}; // Track daily duty hours for each crew
    const crewRestTimes = {}; // Track the earliest time a crew member can start their next flight
    const ineligibleCrew = new Set(); // To store crew IDs who become ineligible

    const crewAssignments = {}; // Track each crew member's schedule
    const flightAssignments = {}; // Track crew assigned to each flight
    const assignedCount = {}; // Track number of flights assigned to each crew

    // Initialize crewAssignments and assignedCount for all crew
    crews.forEach(crew => {
      crewAssignments[crew.crewId] = {
        crewName: crew.name,
        role: crew.role,
        assignedFlights: [], // List of flights assigned to the crew
        reasons: {} // New field to log reasons for unassigned flights
      };
      assignedCount[crew.crewId] = 0;
    });

    // First pass: Assign flights to crew members based on preferences and eligibility
    flights.forEach((flight) => {
      let flightAssigned = false; // Track if the flight is assigned
      const flightCrew = { pilots: [], cabinCrew: [] }; // Track assigned crew for this flight
      const category = flightCategory(flight.duration);
      const required = requiredCrew(category);

      // Assign pilots
      for (const crew of crews) {
        if (flightAssigned) break;

        if (flightCrew.pilots.length < required.pilots && crew.role === "Pilot" &&
            assignedCount[crew.crewId] < 2 && isCrewEligible(crew, flight, crewRestTimes, crewDutyHours)) {
          
          flightCrew.pilots.push(crew.name); // Add to flight crew
          crewAssignments[crew.crewId].assignedFlights.push(flight.flightId); // Update crew schedule
          crewRestTimes[crew.crewId] = new Date(flight.arrival).getTime(); // Update rest time
          crewDutyHours[crew.crewId] = (crewDutyHours[crew.crewId] || 0) + flight.duration;
          assignedCount[crew.crewId]++;
          flightAssigned = true; // Mark the flight as assigned
        } else {
          // Log reasons for ineligibility
          if (crew.healthMetrics.fatigueLevel >= 5) {
            crewAssignments[crew.crewId].reasons[flight.flightId] = "High fatigue level";
          } else if (crew.healthMetrics.sleepHours < 6) {
            crewAssignments[crew.crewId].reasons[flight.flightId] = "Insufficient sleep hours";
          } else if (!crew.certifications.includes(getRequiredCertification(flight))) {
            crewAssignments[crew.crewId].reasons[flight.flightId] = "Lack of required certification";
          } else if (!crew.preferredShifts.includes(getShift(flight.departure))) {
            crewAssignments[crew.crewId].reasons[flight.flightId] = "Flight shift mismatch";
          } else if (crew.preferredRoutes.length > 0 && !crew.preferredRoutes.includes(flight.flightId)) {
            crewAssignments[crew.crewId].reasons[flight.flightId] = "Route not preferred";
          }
        }
      }

      // Assign cabin crew
      for (const crew of crews) {
        if (flightAssigned) break;

        if (flightCrew.cabinCrew.length < required.cabinCrew && crew.role === "Cabin Crew" &&
            assignedCount[crew.crewId] < 2 && isCrewEligible(crew, flight, crewRestTimes, crewDutyHours)) {
          
          flightCrew.cabinCrew.push(crew.name); // Add to flight crew
          crewAssignments[crew.crewId].assignedFlights.push(flight.flightId); // Update crew schedule
          crewRestTimes[crew.crewId] = new Date(flight.arrival).getTime(); // Update rest time
          crewDutyHours[crew.crewId] = (crewDutyHours[crew.crewId] || 0) + flight.duration;
          assignedCount[crew.crewId]++;
          flightAssigned = true; // Mark the flight as assigned
        } else {
          // Log reasons for ineligibility
          if (crew.healthMetrics.fatigueLevel >= 5) {
            crewAssignments[crew.crewId].reasons[flight.flightId] = "High fatigue level";
          } else if (crew.healthMetrics.sleepHours < 6) {
            crewAssignments[crew.crewId].reasons[flight.flightId] = "Insufficient sleep hours";
          } else if (!crew.certifications.includes(getRequiredCertification(flight))) {
            crewAssignments[crew.crewId].reasons[flight.flightId] = "Lack of required certification";
          } else if (!crew.preferredShifts.includes(getShift(flight.departure))) {
            crewAssignments[crew.crewId].reasons[flight.flightId] = "Flight shift mismatch";
          } else if (crew.preferredRoutes.length > 0 && !crew.preferredRoutes.includes(flight.flightId)) {
            crewAssignments[crew.crewId].reasons[flight.flightId] = "Route not preferred";
          }
        }
      }

      // Check if flight has enough staff
      if (flightCrew.pilots.length < required.pilots || flightCrew.cabinCrew.length < required.cabinCrew) {
        flightCrew.status = "More staff needed";
        console.log(`Flight ${flight.flightId} is understaffed. Please assign additional crew.`);
      } else {
        flightCrew.status = "Fully staffed";
      }

      // Save flight assignments
      flightAssignments[flight.flightId] = flightCrew;
    });

    // Second pass: Prioritize critical flights
    const criticalFlights = flights.filter(flight => flightAssignments[flight.flightId].status === "More staff needed");
    criticalFlights.forEach(flight => {
      console.log(`Critical flight ${flight.flightId} needs staff.`);
      // Attempt reassignment or flag for manual intervention
      crews.forEach(crew => {
        if (isCrewEligible(crew, flight, crewRestTimes, crewDutyHours)) {
          if (flightAssignments[flight.flightId].pilots.length < requiredCrew(flightCategory(flight.duration)).pilots && crew.role === "Pilot") {
            flightAssignments[flight.flightId].pilots.push(crew.name);
          } else if (flightAssignments[flight.flightId].cabinCrew.length < requiredCrew(flightCategory(flight.duration)).cabinCrew && crew.role === "Cabin Crew") {
            flightAssignments[flight.flightId].cabinCrew.push(crew.name);
          }
        }
      });

      // If still understaffed, log an issue for manual intervention
      if (flightAssignments[flight.flightId].pilots.length < requiredCrew(flightCategory(flight.duration)).pilots ||
          flightAssignments[flight.flightId].cabinCrew.length < requiredCrew(flightCategory(flight.duration)).cabinCrew) {
        console.log(`Flight ${flight.flightId} is still understaffed.`);
      }
    });

    // Save crew schedules to a JSON file
    const crewScheduleFile = "crewSchedule.json";
    fs.writeFileSync(crewScheduleFile, JSON.stringify(crewAssignments, null, 2));
    console.log(`Crew schedules saved to ${crewScheduleFile}`);

    // Save flight schedules to a JSON file
    const flightScheduleFile = "flightSchedule.json";
    fs.writeFileSync(flightScheduleFile, JSON.stringify(flightAssignments, null, 2));
    console.log(`Flight schedules saved to ${flightScheduleFile}`);

    // Convert crew schedule to FullCalendar events
    const events = [];
    Object.values(crewAssignments).forEach(schedule => {
      schedule.assignedFlights.forEach(flight => {
        events.push({
          title: `${schedule.crewName} (${schedule.role})`,
          start: flight.departure,
          end: flight.arrival
        });
      });
    });

    // Save the events to a JSON file
    const calendarEventsFile = "calendarEvents.json";
    fs.writeFileSync(calendarEventsFile, JSON.stringify(events, null, 2));
    console.log(`Calendar events saved to ${calendarEventsFile}`);

  } catch (err) {
    console.error("Error during scheduling:", err);
  }
}

const pollCrewChanges = async () => {
  setInterval(async () => {
    const crews = await User.find();
    for (const crew of crews) {
      if (crew.healthMetrics.fatigueLevel >= 5) {
        console.log(`Crew ${crew.name} is fatigued. Reassigning flights.`);
        await scheduleCrew(); // Reschedule flights
        break; // Exit loop after rescheduling
      }
    }
  }, 60000); // Poll every 60 seconds
};
async function simulateAndReschedule() {
  await updateCrewHealthMetrics(1, 8, 4); // Simulate health changes for crew member with crewId 1
  await scheduleCrew(); // Reschedule flights
  pollCrewChanges(); // Start polling for crew health updates
}

  const saveSchedule = async (payload = {}) => {
   try{

 
simulateAndReschedule();

   }
    catch(error){
      return error.message
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
        // const schedule = await Schedule
        // .find()
        // return schedule;

        const getSchedule = await FlightSchedule.find();
        return getSchedule;
    }
    catch(error){
        throw new Error(error.message)
    }
}

export { saveSchedule, getScheduleById, getAllSchedule };