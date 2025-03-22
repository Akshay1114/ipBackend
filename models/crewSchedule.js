import mongoose from "mongoose";

const crewScheduleSchema = new mongoose.Schema({
  employee_ID: {
    type: String,
    required: true
  },
  crewName: {
    type: String,
    required: true
  },
  designation: {
    type: String,
    required: true
  },
  assignedFlights: {
    type: [String],
    default: []
  },
  reasons: {
    type: Map,
    of: String,
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const CrewSchedule = mongoose.model('CrewSchedule', crewScheduleSchema);

export default CrewSchedule;