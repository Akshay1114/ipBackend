import mongoose from "mongoose";

const sleepDataSchema = mongoose.Schema({

    employee_ID: {type:String},
    sleep_duration: {type:String},
    start_sleep: {type:String},
    end_sleep: {type:String},
    light_sleep: {type:String},
    deep_sleep: {type:String},
    rem_sleep: {type:String},
    sleep:{type:Array},
    heartRate:{type:Array},
  },
  {timestamps: true}

);
const SleepDataModel = mongoose.model('SleepDataModel', sleepDataSchema);

export { SleepDataModel };