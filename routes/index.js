import { Router } from 'express';

import { userController } from '../controllers/index.js';
import { userSleepDataController } from '../controllers/sleepController.js';


const router = Router();

router.use('/user', userController);
router.use('/sleepData', userSleepDataController);
// router.user('/user', userController.login);

// router.use('/createUser', userController);

export { router };