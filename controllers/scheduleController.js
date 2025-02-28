import { Router } from 'express';
import { makeResponse, responseMessages, statusCodes } from '../helpers/response/index.js';
import { getScheduleById, saveSchedule } from '../services/schedule.js';


const router = Router();

//Response messages
const { SCHEDULE_ADDED, FETCH_USERS, UPDATE_USER, ALREADY_REGISTER, FETCH_USER, DELETE_USER } = responseMessages.EN;
//Response Status code
const { RECORD_CREATED, RECORD_ALREADY_EXISTS, SUCCESS, BAD_REQUEST } = statusCodes;

router.post('/', async(req, res) => {
    console.log("ENTER HERE IN SCHEDULE")
    console.log('req.body', req.body)
    // res.send('Hello World')
    
    saveSchedule(req.body)
    .then(async user => {
        return makeResponse(
        res,
        RECORD_CREATED,
        true,
        SCHEDULE_ADDED,
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
        console.log("ENTER in get schedule by id")
        console.log('req.query', req.query)
        getScheduleById(req.query)
        .then(async user => {
            return makeResponse(
            res,
            RECORD_CREATED,
            true,
            SCHEDULE_ADDED,
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

    export const scheduleController = router;