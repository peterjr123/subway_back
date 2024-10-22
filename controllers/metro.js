import getArrivalInfo from "../utils/metro/arrivals.js";
import getStationCongestionInfo from "../utils/metro/congestions.js";
import getStationsWithinLocation from "../utils/metro/stations.js";

// req: Request
// res: Response
// next: NextFunction

export const stationController = async (req, res) => {
  //   const { latitude, longitude } = req.query;
  const latitude = 37.5395634;
  const longitude = 127.0685233;
  //   const latitude = 37.56680796721996;
  //   const longitude = 126.99413672980332;

  if (!latitude || !longitude) {
    res.status(400).json({ detail: "latitude 와 longitude 는 필수입니다" });
    return;
  }

  try {
    const result = await getStationsWithinLocation(latitude, longitude);
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
};

export const congestionController = async (req, res) => {
  const { stationName } = req.params;

  const now = new Date();
  const day = now.getDay();
  const hour = now.getHours();
  const minute = now.getMinutes();
  const dateType = day === 0 ? "holidays" : day === 6 ? "saturday" : "weekdays";

  try {
    const result = await getStationCongestionInfo(
      stationName,
      dateType,
      `${hour.toString().padStart(2, "0")}:${minute
        .toString()
        .padStart(2, "0")}`
    );
    res.status(200).json({ result });
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
};

export const arrivalController = async (req, res) => {
  const { stationName } = req.params;
  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();

  try {
    const result = await getArrivalInfo(
      stationName,
      `${hour.toString().padStart(2, "0")}:${minute
        .toString()
        .padStart(2, "0")}`
    );
    res.status(200).json({ result });
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
};
