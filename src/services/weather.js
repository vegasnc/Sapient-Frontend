import axiosInstance from './axiosInstance';
import { getWeather } from './Network';
// Should be enabled only in localhost
// import dataWeatherHourMock from './dataWeatherHourMock.json';
// import dataWeatherDayMock from './dataWeatherDayMock.json';

export function getWeatherData(obj) {
    // Should be enabled only in localhost
    // return new Promise((res) => {
    //     if (obj.range === 'hour') {
    //         res(dataWeatherHourMock.data);
    //     } else {
    //         res(dataWeatherDayMock.data);
    //     }
    // });

    const params = `?building_id=${obj?.bldg_id}&date_from=${obj?.date_from}&date_to=${obj?.date_to}&tz_info=${obj?.tz_info}&aggregate=${obj?.range}`;

    return axiosInstance.get(`${getWeather}${params}`).then((res) => res.data);
}
