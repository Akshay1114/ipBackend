import mongoose from "mongoose";

const ScheduleSchema = new mongoose.Schema({
  employee_ID: { type: String, required: true, unique: true },
  name: String,
  experience: Number,
  qualification: { type: String, enum: ['PPL', 'CPL', 'ATPL'] },
  sleepHours: Number,
  maxWeeklyHours: Number,
  schedules: [
      {
          week: Number,
          flights: [
              {
                  flight_name: String,
                  required_experience: Number,
                  required_qualification: String,
                  duration: Number,
                  start_time: Date,
                  end_time: Date,
                  assigned: Boolean,
                  warning: { type: String, default: null }
              }
          ]
      }
  ]
}, { timestamps: true });

const Schedule = mongoose.model("Schedule", ScheduleSchema);
export { Schedule };