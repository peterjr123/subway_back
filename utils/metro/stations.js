const readFileFromS3 = require('../s3')
const geolib = require('geolib')

const sampleStationInfo = [
    {
        id: '412',
        name: '창동',
        lineNumber: '4',
        latitude: '37.652993',
        longitude: '127.046746'
    },
    {
        id: '412',
        name: '창동',
        lineNumber: '4',
        latitude: '37.652993',
        longitude: '127.046746'
    }
]

/**
 * 반경 1km 이내의 모든 지하철 역 정보 조회
 * @param latitude(number): 위도
 * @param longitude(number): 경도
 * @return 지하철 역 정보 JSON Array - 위 sample 참조
 */
export const getStationsWithinLocation = async (latitude, longitude) => {
    const stations = await readFileFromS3('stationLocations.csv')
    const stationsWithinLocation = stations
        .filter(station => {
            // 두점사이의 거리
            const distance = geolib.getDistance(
                { latitude, longitude },
                { latitude: station.latitude, longitude: station.longitude }
            );
            return distance / 1000 <= 1;
        })
        .sort((station1, station2) => station1.name.localeCompare(station2.name));

    console.log(`total ${stationsWithinLocation.length} stations within 1km`);

    return stationsWithinLocation;
}