import { Router } from 'express';
import { makeResponse, responseMessages, statusCodes } from '../helpers/response/index.js';
import { saveFlightData, getFlightSchedule } from '../services/flight.js';


const router = Router();

//Response messages
const { USER_ADDED, FETCH_USERS, UPDATE_USER, ALREADY_REGISTER, FETCH_USER, SLEEPDATA_FETCHED } = responseMessages.EN;
//Response Status code
const { RECORD_CREATED, RECORD_ALREADY_EXISTS, SUCCESS, BAD_REQUEST } = statusCodes;




router.post('/', async(req, res) => {
    console.log("ENTER in get schedule by id")
    console.log('req.query', req.query)
    const { id } = req.query;
    saveFlightData(id)
    .then(async user => {
        return makeResponse(
        res,
        RECORD_CREATED,
        true,
        SLEEPDATA_FETCHED,
        user
        );
    })
    .catch(async error => {
        return makeResponse(
        res,
        RECORD_ALREADY_EXISTS,
        false,
        error.message
        );
    });
    });

router.get('/', async(req, res) => {

    getFlightSchedule()
    .then(async user => {
        return makeResponse(
        res,
        RECORD_CREATED,
        true,
        SLEEPDATA_FETCHED,
        user
        );
    })
    .catch(async error => {
        return makeResponse(
        res,
        RECORD_ALREADY_EXISTS,
        false,
        error.message
        );
    });
});

    export const flightController = router;