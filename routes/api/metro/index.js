import express from 'express';
import stationRouter from './stationRouter.js';

const router = express.Router();

router.use('/stations', stationRouter)

export default router;