import { SleepDataModel } from "../models/sleepData.js";


const getSleepData = async (search = {}) => {
    try{
        console.log('Sleep data payload', search)
        const sleepData = await SleepDataModel.findOne({employee_ID :search}).sort({ createdAt: -1 });;
        console.log('Sleep data', sleepData)
        return sleepData;
    }
    catch(error){
        throw new Error(error.message)
    }
}

const saveSleepData = async (payload = {}) => {
    try{
        console.log('Sleep data payload', payload)
        const sleepData = new SleepDataModel(payload);
        sleepData.save();
        return "Sleep data saved successfully";
    }
    catch(error){
        throw new Error(error.message)
    }
}

export { getSleepData, saveSleepData };