import mongoose from "mongoose";

const ScheduleSchema = new mongoose.Schema({
  employee_ID: { type: String, required: true }, // pilot ID
  name: { type: String, required: true }, // pilot's name
  qualification: {
    type: String,
    enum: ['ATPL', 'CPL', 'PPL'],
    required: true,
  },
  sleepData: {
    lastSleepDuration: { type: Number, required: true }, // in hours
    lastSleepDate: { type: Date, required: true }, // last sleep date
  },
  preferences: {
    availableDays: [{ type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] }], // Days they prefer to work
  },
  flights: [
    {
      flightName: { type: String, required: true }, // Flight name/ID
      startTime: { type: Date, required: true }, // Flight start time
      endTime: { type: Date, required: true }, // Flight end time
      flightDuration: { type: Number, required: true }, // Flight duration in hours
      isSleepSufficient: { type: Boolean, default: true }, // Whether sleep is sufficient
      FDTLLimitExceeded: { type: Boolean, default: false }, // Whether FDTL limit is exceeded
    }
  ],
  week: { type: Number, required: true }, // Week number (for scheduling reference)
  isScheduleComplete: { type: Boolean, default: false },
}, { timestamps: true });

const Schedule = mongoose.model("Schedule", ScheduleSchema);
export { Schedule };