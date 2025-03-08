import { Router } from 'express';
import { makeResponse, responseMessages, statusCodes } from '../helpers/response/index.js';
import { getSleepData, saveSleepData } from '../services/sleepData.js';

const router = Router();

//Response messages
const { USER_ADDED, FETCH_USERS, UPDATE_USER, ALREADY_REGISTER, FETCH_USER, SLEEPDATA_FETCHED } = responseMessages.EN;
//Response Status code
const { RECORD_CREATED, RECORD_ALREADY_EXISTS, SUCCESS, BAD_REQUEST } = statusCodes;




router.get('/', async(req, res) => {
    console.log("ENTER in get schedule by id")
    console.log('req.query', req.query)
    const { id } = req.query;
    getSleepData(id)
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

router.post('/saveSleepData', async(req, res) => {
    console.log("saveSleepData FROM MOBIEL APP SAVE TO DB")
    console.log('req.body', req.body)
    console.log("Mu controller is ready")
    // const { mobile } = req.body;
    
    saveSleepData(req.body)
        .then(async user => {
        return makeResponse(
            res,
            RECORD_CREATED,
            true,
            USER_ADDED,
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

    export const sleepController = router;