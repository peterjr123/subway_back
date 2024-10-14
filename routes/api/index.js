import express from 'express';
import metroRouter from './metro/index.js';

const router = express.Router();

router.use('/metro', metroRouter)

export default router;