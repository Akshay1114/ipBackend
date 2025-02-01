import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import './loaders/index.js'
import { router } from './routes/index.js'
import bodyParser from 'body-parser';
dotenv.config();

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/', router);

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
	console.log('Server is listening on port ', PORT);
});
