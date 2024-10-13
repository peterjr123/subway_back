const express = require('express');
const stationRouter = require('./stationRouter')
const congestionRouter = require('./congestionRouter')

const router = express.Router();

router.use('/stations', stationRouter)

export default router;