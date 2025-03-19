import mongoose from "mongoose";

const crewScheduleSchema = new mongoose.Schema({
  crewId: {
    type: Number,
    required: true
  },
  crewName: {
    type: String,
    required: true
  },
  role: {
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