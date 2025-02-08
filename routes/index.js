import { Router } from 'express';

import { userController } from '../controllers/index.js';
import { userSleepDataController } from '../controllers/sleepController.js';


const router = Router();

router.use('/createUser', userController);
router.use('/sleepData', userSleepDataController);

// router.use('/createUser', userController);

export { router };