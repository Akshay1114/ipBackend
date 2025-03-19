import FlightSchedule from "../models/flightSchedule.js";
import {connectDB} from "../loaders/db/index.js";

async function saveFlightSchedule(flightAssignments) {
  try {
    // Connect to the database
    await connectDB();
    console.log("Connected to MongoDB Atlas in saveFlightSchedule");
    
    // First clear existing records to avoid duplicates
    await FlightSchedule.deleteMany({});
    
    // Convert the flight assignments object to an array for bulk insert
    const schedules = Object.entries(flightAssignments).map(([flightId, data]) => ({
      flightId,
      pilots: data.pilots || [],
      cabinCrew: data.cabinCrew || [],
      status: data.status || 'More staff needed'
    }));
    
    // Insert the data into MongoDB
    if (schedules.length > 0) {
      await FlightSchedule.insertMany(schedules);
      console.log(`${schedules.length} flight schedules saved to MongoDB Atlas`);
    } else {
      console.log("No flight schedules to save");
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error saving flight schedules:", error);
    return { success: false, error: error.message };
  }
}

export default saveFlightSchedule;