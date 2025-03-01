import { Router } from 'express';

import { userController } from '../controllers/index.js';
import { sleepController } from '../controllers/sleepController.js';
import { scheduleController } from '../controllers/scheduleController.js';
import { verifyToken } from '../middleware/verfifyToke.js';
// import { verifyToken} from './middleware/verifyToken.js'

const router = Router();

router.use('/user', userController);
router.use('/sleepData', sleepController);
// router.use('/schedule',verifyToken, scheduleController)
router.use('/schedule', scheduleController)

export { router };