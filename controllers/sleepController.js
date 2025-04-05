import { Router } from 'express';
import { makeResponse, responseMessages, statusCodes } from '../helpers/response/index.js';
import { getSleepData, saveSleepData } from '../services/sleepData.js';
import dotenv from 'dotenv';
import axios from 'axios';
import qs from 'qs';
import { SleepDataModel } from '../models/sleepData.js';
dotenv.config();
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

    router.post("/get-access-token", async (req, res) => {
        console.log("ENTER get-access-token")
        const { code } = req.body;
        console.log('code', code)
        console.log('process.env.FITBIT_CLIENT_ID', process.env.FITBIT_CLIENT_ID)
        console.log('process.env.FITBIT_CLIENT_SECRET', process.env.FITBIT_CLIENT_SECRET)
        try {
            const response = await axios.post("https://api.fitbit.com/oauth2/token",
            qs.stringify({
                client_id: process.env.FITBIT_CLIENT_ID,
                client_secret: process.env.FITBIT_CLIENT_SECRET,
                grant_type: "authorization_code",
                code: code,
                // redirect_uri: "https://wingwise.org/callback",
                redirect_uri: "http://localhost:5173/callback",
            }),
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Authorization": "Basic " + Buffer.from(`${process.env.FITBIT_CLIENT_ID}:${process.env.FITBIT_CLIENT_SECRET}`).toString("base64"),
                }
            }
        );

        res.json({ access_token: response.data.access_token });
        } catch (error) {
            res.status(400).json({ error: "Error getting access token", err: error });
        }
    });

    router.post("/fetch-sleep-data", async (req, res) => {
        const { accessToken, date } = req.body;
        console.log('accessToken', accessToken);
        console.log('date parameter', date);
        
        try {
            const formatDate = (date) => date.toISOString().split("T")[0]; // Format as YYYY-MM-DD
            
            let startDate, endDate;
            
            if (date && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
                // If a valid date is provided, use it for both start and end date
                startDate = date;
                endDate = date;
            } else {
                // Default behavior - fetch last 7 days
                const today = new Date();
                const lastWeekStart = new Date(today);
                lastWeekStart.setDate(today.getDate() - 7); // 7 days ago
                
                startDate = formatDate(lastWeekStart);
                endDate = formatDate(today);
            }
            
            console.log(`Fetching sleep data from ${startDate} to ${endDate}`);
            
            const response = await axios.get(`https://api.fitbit.com/1.2/user/-/sleep/date/${startDate}/${endDate}.json`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            console.log("1")
            const heartRateResponse = await axios.get(`https://api.fitbit.com/1/user/-/activities/heart/date/${startDate}/${endDate}.json`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            console.log("2")
            
            const apiRes = {
                sleep: response.data.sleep,
                heartRate: heartRateResponse.data['activities-heart']
            }
            const sleepData = new SleepDataModel({
                employee_ID: "123456",
                sleep: response.data.sleep,
                heartRate: heartRateResponse.data['activities-heart']
              });
              
              await sleepData.save();
            res.json({ sleep: response.data.sleep,
                heartRate: heartRateResponse.data['activities-heart'] });
        } catch (error) {
            console.error("Error fetching sleep data:", error.message);
            res.status(400).json({ error: "Error fetching sleep data", message: error.message });
        }
    });
    export const sleepController = router;