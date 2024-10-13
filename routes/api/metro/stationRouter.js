import express from 'express'
import { arrivalController, congestionController, stationController } from '../../../controllers/metro.js'

const router = express.Router()

router.get('/', stationController)
router.get('/:stationName/congestions', congestionController)
router.get('/:stationName/arrivals', arrivalController)

export default router;
