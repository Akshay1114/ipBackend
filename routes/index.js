import { Router } from 'express';

import { userController } from '../controllers/index.js';
import { sleepController } from '../controllers/sleepController.js';
import { scheduleController } from '../controllers/scheduleController.js';


const router = Router();

router.use('/user', userController);
router.use('/sleepData', sleepController);
router.use('/schedule', scheduleController)
// router.user('/user', userController.login);

// router.use('/createUser', userController);

export { router };