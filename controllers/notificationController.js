import { Router } from 'express';
import { makeResponse, responseMessages, statusCodes } from '../helpers/response/index.js';
import { getScheduleById, saveSchedule, getAllSchedule } from '../services/schedule.js';
import { Notification } from '../models/notification.js';


const router = Router();

//Response messages
const { SCHEDULE_ADDED, FETCH_USERS, UPDATE_USER, ALREADY_REGISTER, FETCH_USER, DELETE_USER } = responseMessages.EN;
//Response Status code
const { RECORD_CREATED, RECORD_ALREADY_EXISTS, SUCCESS, BAD_REQUEST } = statusCodes;

router.get('/', async(req, res) => {
    try{
        console.log("ENTER in get notification by id")
        const { userID } = req.query;
        console.log('userID', userID)
        const notifications = await Notification.find({
          $or: [{ recipient: userID }, { recipient: "all" }],
        }).sort({ timestamp: -1 });
      
        res.status(200).json(notifications);
    }
   catch(error){
    res.status(400).json({ message: error.message });
   }
});

export const notificationController = router;