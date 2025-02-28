import mongoose from "mongoose";

const ScheduleSchema = new mongoose.Schema({
  employee_ID: { type: String, required: true },
  name: { type: String, required: true },
  weekStartDate: { type: Date, required: true },
  flightStart: { type: String },
  flightEnd: { type: String },
  experience: { type: String, required: true },
  warning: { type: Array, default: null },
  qualification: { type: String, required: true },
}, { timestamps: true });

const Schedule = mongoose.model("Schedule", ScheduleSchema);
export { Schedule };