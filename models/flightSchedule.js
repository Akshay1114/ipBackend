import mongoose from "mongoose";

const flightScheduleSchema = new mongoose.Schema({
  flightId: {
    type: String,
    required: true
  },
  pilots: {
    type: [String],
    default: []
  },
  cabinCrew: {
    type: [String],
    default: []
  },
  status: {
    type: String,
    enum: ['Fully staffed', 'More staff needed'],
    default: 'More staff needed'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const FlightSchedule = mongoose.model('FlightSchedule', flightScheduleSchema);

export default FlightSchedule;