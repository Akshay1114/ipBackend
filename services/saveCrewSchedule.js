import mongoose from "mongoose";
import CrewSchedule from "../models/crewSchedule.js";
import {connectDB} from "../loaders/db/index.js";
// const crewSchedule = require("./crewSchedule.json"); // Replace with the path to your JSON file
// import crewSchedule from "./crewSchedule.json"; // Replace with the path to your JSON file

async function saveCrewSchedule(crewAssignments) {
  try {
    // First clear existing records to avoid duplicates
    await CrewSchedule.deleteMany({});
    
    // Convert the crew assignments object to an array for bulk insert
    const schedules = Object.entries(crewAssignments).map(([crewId, data]) => ({
      crewId: parseInt(crewId),
      crewName: data.crewName,
      role: data.role,
      assignedFlights: data.assignedFlights,
      reasons: data.reasons
    }));
    
    // Insert the data into MongoDB
    if (schedules.length > 0) {
      await CrewSchedule.insertMany(schedules);
      console.log(schedules)
      console.log(`${schedules.length} crew schedules saved to MongoDB Atlas`);
    } else {
      console.log("No crew schedules to save");
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error saving crew schedules:", error);
    return { success: false, error: error.message };
  }
}

const db = await connectDB();
if (db) {
  saveCrewSchedule(crewSchedule);
}

export default saveCrewSchedule;