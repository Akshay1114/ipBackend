import { SleepDataModel } from "../models/sleepData.js";
import axios from 'axios';
import querystring from 'querystring';

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
        // const sleepData = new SleepDataModel(payload);
        // sleepData.save();
        // app.get('/auth/fitbit', (req, res) => {
        //     const authUrl = `https://www.fitbit.com/oauth2/authorize?${querystring.stringify({
        //         response_type: 'code',
        //         client_id: process.env.FITBIT_CLIENT_ID,
        //         redirect_uri: process.env.FITBIT_REDIRECT_URI,
        //         scope: ['sleep', 'activity', 'heartrate', 'profile'],
        //     })}`;
        //     res.redirect(authUrl);
        //   });
          
          app.get('/auth/fitbit/callback', async (req, res) => {
            const { code } = req.query;
            if (!code) return res.status(400).json({ error: 'Authorization code not found' });
          
            try {
                const tokenResponse = await axios.post('https://api.fitbit.com/oauth2/token',
                    querystring.stringify({
                        client_id: process.env.FITBIT_CLIENT_ID,
                        client_secret: process.env.FITBIT_CLIENT_SECRET,
                        grant_type: 'authorization_code',
                        redirect_uri: process.env.FITBIT_REDIRECT_URI,
                        code: code,
                    }),
                    {
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                            'Authorization': `Basic ${Buffer.from(`${process.env.FITBIT_CLIENT_ID}:${process.env.FITBIT_CLIENT_SECRET}`).toString('base64')}`
                        }
                    }
                );
          
                const { access_token, refresh_token } = tokenResponse.data;
          
                const today = new Date();
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(today.getDate() - 6); // Go back 6 days from today
          
          const startDate = sevenDaysAgo.toISOString().split('T')[0]; // Format: YYYY-MM-DD
          const endDate = today.toISOString().split('T')[0]; // Format: YYYY-MM-DD
                // Step 3: Fetch Sleep Data
                const sleepResponse = await axios.get(`https://api.fitbit.com/1.2/user/-/sleep/date/${startDate}/${endDate}.json`, {
                  headers: { Authorization: `Bearer ${access_token}` }
              });
          
                res.json({
                    sleepData: sleepResponse.data,
                    accessToken: access_token,
                    refreshToken: refresh_token
                });
          
            } catch (error) {
                console.error('Error getting Fitbit data:', error.response?.data || error.message);
                res.status(500).json({ error: 'Failed to obtain access token' });
            }
          });
        return "Sleep data saved successfully";
    }
    catch(error){
        throw new Error(error.message)
    }
}

export { getSleepData, saveSleepData };