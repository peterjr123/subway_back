const readFileFromS3 = require('../s3')
const axios = require('axios')
const stationDelta = require('stationDelta')

const sampleArrivalInfo = {
    id: 1234,
    name: '건대입구',
    lineNumber: 2,
    prevStation: '성수',
    nextStation: '구의',
    direction: 1, // 1: 상행/내선 2:하행/내선
    arriveTime: '12:34',
};

/**
 * 해당 역의 실시간 지하철 도착정보 조회
 * @param stationName(string) 역 이름
 * @param time(string) 시간 HH:mm
 * @return 실시간 도착정보 JSON Array - 위 sample 참조
 */
export const getArrivalInfo = async (stationName, time) => {
    const stations = await readFileFromS3('stationLocations.csv')
    const apikey = 'sample'; // 환경변수든 뭐든 openapi key
    const apiResults = [];
    let pageStart = 0;
    let pageEnd = pageStart + 5;

    while (true) {
        const url = `http://swopenapi.seoul.go.kr/api/subway/${apikey}/json/realtimeStationArrival/${pageStart}/${pageEnd}/${stationName}`;
        const { errorMessage, realtimeArrivalList } = (await axios.get(url)).data;
        apiResults.push(
            ...realtimeArrivalList.map(arrival => {
                const [hh, mm] = time.split(':');
                const arriveTimeMins = Math.floor(parseInt(arrival.barvlDt) / 60);

                const lineNumber = parseInt(arrival.subwayId.slice(-1));

                // 시간 구하기
                let newHour = parseInt(hh);
                let newMinute = parseInt(mm) + arriveTimeMins;
                if (newMinute >= 60) {
                    newMinute -= 60;
                    newHour += 1;
                }
                newHour = newHour % 24;

                return {
                    name: arrival.statnNm,
                    lineNumber,
                    direction:
                        arrival.updnLine === '상행' || arrival.updnLine === '내선'
                            ? '1'
                            : '2',
                    prevStation: stations.find(
                        station =>
                            (parseInt(station.id) + stationDelta[lineNumber]).toString() ===
                            arrival.statnFid.slice(-3)
                    ).name,
                    nextStation: stations.find(
                        station =>
                            (parseInt(station.id) + stationDelta[lineNumber]).toString() ===
                            arrival.statnTid.slice(-3)
                    ).name,
                    arriveTime: `${newHour}:${newMinute}`,
                };
            })
        );

        const count = errorMessage.total;
        if (pageEnd > count) {
            break;
        }

        pageStart = pageEnd + 1;
        pageEnd = pageStart + 5;
    }

    return apiResults;
};
