import axiosInstance from './axiosInstance';
import { compareBuildings } from './Network';

export function fetchCompareBuildings(params, payload) {
    return axiosInstance.post(`${compareBuildings}${params}`, payload).then((res) => res);
}

export function getCarbonBuildingChartData(activeBuildingId,params) {
    return axiosInstance.get(`/api/V2/metrics/building/carbon/${activeBuildingId}`,params).then((res) => {
        return res;
    });
}
