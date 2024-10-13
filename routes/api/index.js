const express = require('express');
const metroRouter = require('./metro')

const router = express.Router();

router.use('/metro', metroRouter)

export default router;