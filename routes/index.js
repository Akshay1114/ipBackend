import { Router } from 'express';

import { userController } from '../controllers/index.js';

const router = Router();

router.use('/createUser', userController);

// router.use('/createUser', userController);

export { router };