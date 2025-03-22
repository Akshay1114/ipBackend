// import {Flight} from "../models/flight.js";

import { Flight } from "../models/flight.js";



const saveFlightData = async (payload = {}) => {

    try{
        console.log('Flight data payload', payload)
        const flightData = new Flight(payload);
        flightData.save();
        return flightData;
    }
    catch(error){
        throw new Error(error.message)
    }
}

const getFlightSchedule = async () => {
    try{
        const flightData = await Flight.find();
        return flightData;
    }
    catch(error){
        throw new Error(error.message)
    }
}



export { saveFlightData, getFlightSchedule };
