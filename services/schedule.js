import {Schedule} from "../models/schedule.js";
import moment from "moment";

const saveSchedule = async (payload = {}) => {
    try{
        console.log('payload', payload)
        const { schedule, warnings } = payload;
    
        if (!schedule) {
          throw new Error("Invalid request data");
        }
    
        for (const entry of schedule) {
          const weekStartDate = moment().startOf("isoWeek").toDate(); // Monday of current week
            console.log('weekStartDate',  entry.flightStart)
          await Schedule.create({
            pilotId: entry.pilotId,
            name: entry.name,
            weekStartDate,
            flightStart:  entry.flightStart, 
            flightEnd:  entry.flightEnd,
            experience: entry.experience,
            qualification: entry.qualification,
            warning: entry.warnings
          });
        }
        return "Schedule saved successfully!";
        // res.status(201).json({ message: "✅ Schedule saved successfully!" });
    }catch(error){
        throw new Error(error.message)
    }
}

export { saveSchedule };