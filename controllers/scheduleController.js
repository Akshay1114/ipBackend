import { Router } from 'express';
import { makeResponse, responseMessages, statusCodes } from '../helpers/response/index.js';
import { getScheduleById, saveSchedule, getAllSchedule } from '../services/schedule.js';
import { Schedule } from '../models/schedule.js';
import { simulateAndReschedule } from '../services/scheduler.js';
// import {trainModel} from '../aiModel/aiTrain.js'


const router = Router();

//Response messages
const { SCHEDULE_ADDED, FETCH_USERS, UPDATE_USER, ALREADY_REGISTER, FETCH_USER, DELETE_USER } = responseMessages.EN;
//Response Status code
const { RECORD_CREATED, RECORD_ALREADY_EXISTS, SUCCESS, BAD_REQUEST } = statusCodes;

router.post('/', async(req, res) => {
    console.log("ENTER HERE IN SCHEDULE")
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
    // router.post("/train", async (req, res) => {
    //     const trainingData = await Schedule.find();
    //     await trainModel(trainingData);
    //     res.json({ message: "AI Model Trained Successfully!" });
    //   });
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
router.get('/allSchedule', async(req, res) => {
    getAllSchedule()
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

router.get('/requestedSchedule', async(req, res) => {
    console.log("ENTER in get schedule")
    res.send("Requested Schedule")
    
});

router.post('/updateSchedule', async(req, res) => {
    console.log("ENTER in update schedule")
    simulateAndReschedule()
    res.send("Schedule Updated")
});

    export const scheduleController = router;