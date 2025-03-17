import mongoose from "mongoose";
// import { promises as fs } from "fs";
import {connectDB} from "../loaders/db/index.js";
// import saveCrewSchedule from "./saveCrewSchedule.js";
// import saveFlightSchedule from "./saveFlightSchedule.js";

// MongoDB Connection
async function connectToDB() {
  try {
    await connectDB();
    console.log("Connected to MongoDB Atlas");
  } catch (err) {
    console.error("Error connecting to MongoDB Atlas:", err);
  }
}

connectToDB();

// Define Schemas
const Crew = mongoose.model("Crew", new mongoose.Schema({
  crewId: Number,
  name: String,
  role: String,
  certifications: [String],
  preferredShifts: [String],
  preferredRoutes: [String],
  unavailableDates: [Date],
  healthMetrics: {
    fatigueLevel: Number,
    sleepHours: Number,
    heartRate: Number
  }
}));

const Flight = mongoose.model("Flight", new mongoose.Schema({
  flightId: String,
  departure: Date,
  arrival: Date,
  duration: Number,
  category: String
}));

const CrewSchedule = mongoose.model("CrewSchedule", new mongoose.Schema({
  crewId: Number,
  crewName: String,
  role: String,
  assignedFlights: [String],
  reasons: Object
}));

const FlightSchedule = mongoose.model("FlightSchedule", new mongoose.Schema({
  flightId: String,
  pilots: [String],
  cabinCrew: [String],
  status: String
}));

// FDTL Constraints
const MAX_DUTY_HOURS = 10;
const MIN_REST_PERIOD = 8 * 60 * 60 * 1000;

async function updateCrewHealthMetrics(crewId, fatigueLevel, sleepHours) {
  const updatedCrew = await Crew.findOneAndUpdate(
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
  return { pilots: 2, cabinCrew: 8 };
};

async function scheduleCrew() {
  try {
    const crews = await Crew.find();
    const flights = await Flight.find().sort({ departure: 1 });

    const crewAssignments = {};
    const flightAssignments = {};
    const assignedCount = {};
    const crewDutyHours = {};
    const crewRestTimes = {};

    crews.forEach(crew => {
      crewAssignments[crew.crewId] = {
        crewName: crew.name,
        role: crew.role,
        assignedFlights: [],
        reasons: {}
      };
      assignedCount[crew.crewId] = 0;
    });

    flights.forEach((flight) => {
      const flightCrew = { pilots: [], cabinCrew: [] };
      flightAssignments[flight.flightId] = flightCrew;
    });

    await CrewSchedule.deleteMany();
    const crewScheduleDocs = Object.entries(crewAssignments).map(([crewId, schedule]) => ({
      crewId: parseInt(crewId),
      ...schedule
    }));
    await CrewSchedule.insertMany(crewScheduleDocs);

    await FlightSchedule.deleteMany();
    const flightScheduleDocs = Object.entries(flightAssignments).map(([flightId, assignment]) => ({
      flightId,
      ...assignment
    }));
    await FlightSchedule.insertMany(flightScheduleDocs);

    console.log("Schedules generated and saved to MongoDB Atlas!");
  } catch (err) {
    console.error("Error during scheduling:", err);
  }
}

const pollCrewChanges = async () => {
    const crews = await Crew.find();
    for (const crew of crews) {
      if (crew.healthMetrics.fatigueLevel >= 5) {
        console.log(`Crew ${crew.name} is fatigued. Reassigning flights.`);
        await scheduleCrew();
        break;
      }
    }
};

async function simulateAndReschedule() {
  await updateCrewHealthMetrics(1, 8, 4);
  await scheduleCrew();
  pollCrewChanges();
}

export {simulateAndReschedule};
