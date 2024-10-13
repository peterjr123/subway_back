const express = require('express')
const getStationsWithinLocation = require('../../../utils/metro/stations')
const getStationCongestionInfo = require('../../../utils/metro/congestions')
const getArrivalInfo = require('../../../utils/metro/arrivals')

const router = express.Router()

router.get('/', async (req, res) => {
    const { latitude, longitude } = req.query;
    if (!latitude || !longitude) {
        res.status(400).json({ detail: 'latitude 와 longitude 는 필수입니다' })
    }

    try {
        const result = await getStationsWithinLocation(latitude, longitude);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json(error);
    }
})

router.get('/:stationName/congestions', async (req, res) => {
    const { stationName } = req.params;

    const now = new Date();
    const day = now.getDay();
    const hour = now.getHours();
    const minute = now.getMinutes();
    const dateType = day === 0 ? 'holidays' : day === 6 ? 'saturday' : 'weekdays';

    try {
        const result = await getStationCongestionInfo(stationName, datetype, `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
        res.status(200).json({ result });
    } catch (error) {
        res.status(500).json(error);
    }
})

router.get('/:stationName/arrivals', async (req, res) => {
    const { stationName } = req.params;
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();

    try {
        const result = await getArrivalInfo(stationName, `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
        res.status(200).json({ result });
    } catch (error) {
        res.status(500).json(error);
    }
})