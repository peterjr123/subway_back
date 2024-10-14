import axios from 'axios';
import dotenv from 'dotenv';
import readFileFromS3 from '../s3.js';
import stationDelta from './stationDelta.js';

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
const getArrivalInfo = async (stationName, time) => {
    const stations = await readFileFromS3('stationLocations.csv');

    if (process.env.NODE_ENV !== 'production') {
        dotenv.config();
    }
    const apikey = process.env.API_KEY; // 환경변수든 뭐든 openapi key
    const apiResults = [];
    let pageStart = 0;
    let pageEnd = pageStart + 5;

    while (true) {
        const url = `http://swopenapi.seoul.go.kr/api/subway/${apikey}/json/realtimeStationArrival/${pageStart}/${pageEnd}/${stationName}`;
        const data = (await axios.get(url)).data;

        if (Object.keys(data).includes('realtimeArrivalList')) {
            const { errorMessage, realtimeArrivalList } = data;

            apiResults.push(
                ...realtimeArrivalList.map(arrival => {
                    const [hh, mm] = time.split(':');
                    const arriveTimeMins = Math.floor(parseInt(arrival.barvlDt) / 60);

                    const lineNumber = parseInt(arrival.subwayId.slice(-1));

                    // 이전, 다음 역명 구하기
                    const prevStation = stations.find(station => {
                        const stationNum = parseInt(station.id) + stationDelta[lineNumber];
                        return stationNum.toString() === arrival.statnFid.slice(-3);
                    });

                    const nextStation = stations.find(station => {
                        const stationNum = parseInt(station.id) + stationDelta[lineNumber];
                        return stationNum.toString() === arrival.statnTid.slice(-3);
                    });

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
                        prevStation: prevStation.name,
                        nextStation: nextStation.name,
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
        } else {
            // 막차 끊김 등으로 실시간 도착정보가 없는 경우엔 API 응답 형식이 전혀 다름 (개발자_단가를_후려쳤을때.txt)
            return '이 역에 해당 시간대의 도착 차량은 존재하지 않습니다';
        }
    }

    return apiResults;
};

export default getArrivalInfo;
