import mongoose from "mongoose";
// import { promises as fs } from "fs";
// import {connectDB} from "../loaders/db/index.js";
import saveCrewSchedule from "./saveCrewSchedule.js";
import saveFlightSchedule from "./saveFlightSchedule.js";
import { Flight } from "../models/flight.js";
import { User } from "../models/index.js";

// MongoDB Connection
// async function connectToDB() {
//   try {
//     await connectDB();
//     console.log("Connected to MongoDB Atlas");
//   } catch (err) {
//     console.error("Error connecting to MongoDB Atlas:", err);
//   }
// }

// connectToDB();

// Define Schemas
// const Crew = mongoose.model("Crew", new mongoose.Schema({
//   crewId: Number,
//   name: String,
//   role: String,
//   certifications: [String],
//   preferredShifts: [String], // e.g., ["Morning", "Evening"]
//   preferredRoutes: [String], // e.g., ["AB123", "CD456"]
//   unavailableDates: [Date],  // e.g., [new Date("2025-03-15")]
//   healthMetrics: {
//     fatigueLevel: Number,
//     sleepHours: Number,
//     heartRate: Number
//   }
// }));

// const Flight = mongoose.model("Flight", new mongoose.Schema({
//   flightId: String,
//   departureLocation: String,
//   arrivalLocation: String,
//   departure: Date,
//   arrival: Date,
//   duration: Number,
//   category: String // e.g., "Short-haul", "Mid-haul", "Long-haul"
// }));

// FDTL Constraints
const MAX_DUTY_HOURS = 10; // Max hours a crew can work in one day
const MIN_REST_PERIOD = 8 * 60 * 60 * 1000; // 8 hours in milliseconds

// Function to update crew health metrics
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

// Determine flight category based on duration
const flightCategory = (duration) => {
  if (duration <= 3) return "Short-haul";
  if (duration <= 6) return "Mid-haul";
  return "Long-haul";
};

// Determine required crew based on flight category
const requiredCrew = (category) => {
  if (category === "Short-haul") return { pilots: 2, cabinCrew: 4 };
  if (category === "Mid-haul") return { pilots: 2, cabinCrew: 6 };
  return { pilots: 2, cabinCrew: 8 }; // Long-haul
};

// Helper function to determine the shift of a flight
const getShift = (departureTime) => {
  const hour = new Date(departureTime).getHours();
  if (hour >= 6 && hour < 12) return "Morning";
  if (hour >= 12 && hour < 18) return "Afternoon";
  return "Night";
};

// Helper function to determine the required certification for a flight
const getRequiredCertification = (flight) => {
  // Example logic to fetch required certifications
  return flight.category === "Long-haul" ? "Airbus A380" : "Boeing 737";
};

// Check if crew is eligible for a flight
const isCrewEligible = (crew, flight, crewRestTimes, crewDutyHours) => {
  const flightDeparture = new Date(flight.departure);
  const flightArrival = new Date(flight.arrival);
  const flightDuration = (flightArrival - flightDeparture) / (60 * 60 * 1000); // in hours

  return (
    (!crewRestTimes[crew.employee_ID] || crewRestTimes[crew.employee_ID] + MIN_REST_PERIOD <= flightDeparture.getTime()) &&
    (crewDutyHours[crew.employee_ID] || 0) + flightDuration <= MAX_DUTY_HOURS &&
    crew.healthMetrics.fatigueLevel < 5 &&
    crew.healthMetrics.sleepHours >= 6 &&
    crew.healthMetrics.heartRate <= 80 &&
    crew.preferredShifts.includes(getShift(flight.departure)) &&
    (!crew.preferredRoutes.length || crew.preferredRoutes.includes(flight.flightId)) &&
    !crew.unavailableDates.some(date => date.toDateString() === flightDeparture.toDateString())
  );
};

// Scheduler Logic
async function scheduleCrew() {
  try {
    const crews = await User.find();
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
      crewAssignments[crew.employee_ID] = {
        crewName: crew.name,
        designation: crew.designation,
        assignedFlights: [], // List of flights assigned to the crew
        reasons: {} // New field to log reasons for unassigned flights
      };
      assignedCount[crew.employee_ID] = 0;
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

        if (flightCrew.pilots.length < required.pilots && crew.designation === "Pilot" &&
            assignedCount[crew.employee_ID] < 2 && isCrewEligible(crew, flight, crewRestTimes, crewDutyHours)) {
          
          flightCrew.pilots.push(crew.name); // Add to flight crew
          crewAssignments[crew.employee_ID].assignedFlights.push(flight.flightId); // Update crew schedule
          crewRestTimes[crew.employee_ID] = new Date(flight.arrival).getTime(); // Update rest time
          crewDutyHours[crew.employee_ID] = (crewDutyHours[crew.employee_ID] || 0) + flight.duration;
          assignedCount[crew.employee_ID]++;
          flightAssigned = true; // Mark the flight as assigned
        } else {
          // Log reasons for ineligibility
          if (crew.healthMetrics.fatigueLevel >= 5) {
            crewAssignments[crew.employee_ID].reasons[flight.flightId] = "High fatigue level";
          } else if (crew.healthMetrics.sleepHours < 6) {
            crewAssignments[crew.employee_ID].reasons[flight.flightId] = "Insufficient sleep hours";
          } else if (!crew.certifications.includes(getRequiredCertification(flight))) {
            crewAssignments[crew.employee_ID].reasons[flight.flightId] = "Lack of required certification";
          } else if (!crew.preferredShifts.includes(getShift(flight.departure))) {
            crewAssignments[crew.employee_ID].reasons[flight.flightId] = "Flight shift mismatch";
          } else if (crew.preferredRoutes.length > 0 && !crew.preferredRoutes.includes(flight.flightId)) {
            crewAssignments[crew.employee_ID].reasons[flight.flightId] = "Route not preferred";
          }
        }
      }

      // Assign cabin crew
      for (const crew of crews) {
        if (flightAssigned) break;

        if (flightCrew.cabinCrew.length < required.cabinCrew && crew.designation === "Cabin Crew" &&
            assignedCount[crew.employee_ID] < 2 && isCrewEligible(crew, flight, crewRestTimes, crewDutyHours)) {
          
          flightCrew.cabinCrew.push(crew.name); // Add to flight crew
          crewAssignments[crew.employee_ID].assignedFlights.push(flight.flightId); // Update crew schedule
          crewRestTimes[crew.employee_ID] = new Date(flight.arrival).getTime(); // Update rest time
          crewDutyHours[crew.employee_ID] = (crewDutyHours[crew.employee_ID] || 0) + flight.duration;
          assignedCount[crew.employee_ID]++;
          flightAssigned = true; // Mark the flight as assigned
        } else {
          // Log reasons for ineligibility
          if (crew.healthMetrics.fatigueLevel >= 5) {
            crewAssignments[crew.employee_ID].reasons[flight.flightId] = "High fatigue level";
          } else if (crew.healthMetrics.sleepHours < 6) {
            crewAssignments[crew.employee_ID].reasons[flight.flightId] = "Insufficient sleep hours";
          } else if (!crew.certifications.includes(getRequiredCertification(flight))) {
            crewAssignments[crew.employee_ID].reasons[flight.flightId] = "Lack of required certification";
          } else if (!crew.preferredShifts.includes(getShift(flight.departure))) {
            crewAssignments[crew.employee_ID].reasons[flight.flightId] = "Flight shift mismatch";
          } else if (crew.preferredRoutes.length > 0 && !crew.preferredRoutes.includes(flight.flightId)) {
            crewAssignments[crew.employee_ID].reasons[flight.flightId] = "Route not preferred";
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
          if (flightAssignments[flight.flightId].pilots.length < requiredCrew(flightCategory(flight.duration)).pilots && crew.designation === "Pilot") {
            flightAssignments[flight.flightId].pilots.push(crew.name);
          } else if (flightAssignments[flight.flightId].cabinCrew.length < requiredCrew(flightCategory(flight.duration)).cabinCrew && crew.designation === "Cabin Crew") {
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
    // fs.writeFileSync(crewScheduleFile, JSON.stringify(crewAssignments, null, 2));
    console.log(`Crew schedules saved to ${crewScheduleFile}`);

    // Save flight schedules to a JSON file
    const flightScheduleFile = "flightSchedule.json";
    // fs.writeFileSync(flightScheduleFile, JSON.stringify(flightAssignments, null, 2));
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
    // fs.writeFileSync(calendarEventsFile, JSON.stringify(events, null, 2));
    console.log(`Calendar events saved to ${calendarEventsFile}`);

    // Automatically save schedules to MongoDB after generation
    await saveCrewSchedule(crewAssignments);
    await saveFlightSchedule(flightAssignments);
    // console.log(crewAssignments);
    // console.log(flightAssignments);
    console.log("Schedules generated and saved to MongoDB Atlas!");
    return { crewAssignments, flightAssignments };

  } catch (err) {
    console.error("Error during scheduling:", err);
  }
}

// Poll for crew health updates and reschedule if necessary
const pollCrewChanges = async () => {
  
    const crews = await User.find();
    for (const crew of crews) {
      if (crew.healthMetrics.fatigueLevel >= 5) {
        console.log(`Crew ${crew.name} is fatigued. Reassigning flights.`);
        await scheduleCrew(); // Reschedule flights
        break; // Exit loop after rescheduling
      }
    }
};

// Simulate health changes and reschedule
async function simulateAndReschedule() {
  await updateCrewHealthMetrics(1, 8, 4); // Simulate health changes for crew member with crewId 1
  await scheduleCrew(); // Reschedule flights
  pollCrewChanges(); // Start polling for crew health updates
}

export { simulateAndReschedule };
