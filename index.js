import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import {connectDB} from './loaders/db/index.js';
import { router } from './routes/index.js'
import bodyParser from 'body-parser';
dotenv.config();
connectDB()
const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
console.log('process.env.PORT', process.env.PORT)
app.use('/api/', router);

const PORT = process.env.PORT || 5001;
console.log('PORT', PORT)
app.listen(PORT, () => {
	console.log('Server is listening on port ', PORT);
});
