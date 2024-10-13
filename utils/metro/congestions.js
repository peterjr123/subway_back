const readFileFromS3 = require('../s3')

const sampleCongestionInfo = [
    {
        lineNumber: '2',
        stationId: '240',
        name: '건대입구',
        direction: '1',
        congestion: '106.3',
    },
    {
        lineNumber: '2',
        stationId: '240',
        name: '건대입구',
        direction: '2',
        congestion: '106.3',
    },
    {
        lineNumber: '7',
        stationId: '240',
        name: '건대입구',
        direction: '1',
        congestion: '106.3',
    },
    {
        lineNumber: '7',
        stationId: '240',
        name: '건대입구',
        direction: '2',
        congestion: '106.3',
    }
]

/**
 * 해당 역의 해당 시간의 혼잡도 조회
 * @param stationId(string): 역 ID
 * @param dateType(enum): weekdays/saturday/holidays
 * @param time(string): 시간 HH:mm
 * @return 지하철 혼잡도 정보 JSON - 위 sample 참조
 */
export const getStationCongestionInfo = async (stationName, dateType, time) => {
    const congestions = await readFileFromS3('congestions.csv');
    const rawFilteredInfo = congestions
        .filter(
            congestion =>
                congestion.name === stationName && congestion.dateType === dateType
        )
        .sort((cong1, cong2) => cong1.lineNumber - cong2.lineNumber);

    // console.log(rawFilteredInfo);

    // 시간 필터 만들기
    const [hh, mm] = time.split(':');
    const adjustedTime = `${hh}:${parseInt(mm) >= 30 ? '30' : '00'}`;

    // 해당 시간대의 복잡도만 가져오기
    const selectedCongestionInfo = rawFilteredInfo.map(info => ({
        lineNumber: info.lineNumber,
        stationName: info.stationName,
        name: info.name,
        direction: info.direction,
        congestion: info[adjustedTime],
    }));

    // 같은 호선끼리 묶기
    const iterCount = selectedCongestionInfo.length;
    const results = [];

    for (let index = 0; index < iterCount; index += 2) {
        results.push({
            lineNumber: selectedCongestionInfo[index].lineNumber,
            upDegree: selectedCongestionInfo[index].congestion,
            downDegree: selectedCongestionInfo[index + 1].congestion,
        });
    }

    return {
        name: stationName,
        congestion: results,
    };
};