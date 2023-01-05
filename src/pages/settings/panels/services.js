import _ from 'lodash';
import axiosInstance from '../../../services/axiosInstance';
import {
    generalPanels,
    createPanel,
    updatePanel,
    deletePanel,
    resetBreakers,
    getBreakers,
    getLocation,
    generalEquipments,
    generalPassiveDevices,
    updateLinkBreakers,
    deleteBreaker,
    getFiltersForEquipment,
} from '../../../services/Network';

export function getPanelsData(
    bldgId,
    search,
    pageNo,
    pageSize,
    getParams,
    panelTypeSelected,
    parentPanelSelected,
    locationIdSelected,
    breakerCountSelected,
    panelVoltageSelected
) {
    const searchData = encodeURIComponent(search);
    let params = `?building_id=${bldgId}&device_search=${searchData}&page_size=${pageSize}&page_no=${pageNo}`;

    if (getParams.order_by && getParams.sort_by)
        params += `&ordered_by=${getParams.order_by}&sort_by=${getParams.sort_by}`;
    if (panelTypeSelected.length) params += `&panel_type=${panelTypeSelected}`;
    if (parentPanelSelected.length) params += `&parent_id=${parentPanelSelected}`;
    if (locationIdSelected.length) params += `&location_id=${locationIdSelected}`;
    if (breakerCountSelected.length) params += `&breakers=${breakerCountSelected}`;
    if (panelVoltageSelected.length) params += `&voltage=${panelVoltageSelected}`;

    return axiosInstance.get(`${generalPanels}${params}`).then((res) => res);
}

export function getLocationData(params) {
    return axiosInstance.get(`${getLocation}${params}`).then((res) => res);
}

export function addNewPanel(params, payload) {
    return axiosInstance.post(`${createPanel}${params}`, payload).then((res) => res);
}

export function deleteCurrentPanel(params) {
    return axiosInstance.delete(`${deletePanel}${params}`).then((res) => res);
}

export function getBreakerDeleted(params) {
    return axiosInstance.delete(`${deleteBreaker}${params}`).then((res) => res);
}

export function resetAllBreakers(params, payload) {
    return axiosInstance.post(`${resetBreakers}${params}`, payload).then((res) => res);
}

export function updatePanelDetails(params, payload) {
    return axiosInstance.patch(`${updatePanel}${params}`, payload).then((res) => res);
}

export function getBreakersList(params) {
    return axiosInstance.get(`${getBreakers}${params}`).then((res) => res);
}

export function getEquipmentsList(params, payload = {}) {
    return axiosInstance.post(`${generalEquipments}${params}`, payload).then((res) => res);
}

export function getPassiveDeviceList(params) {
    return axiosInstance.get(`${generalPassiveDevices}${params}`).then((res) => res);
}

export function updateBreakersLink(params, payload) {
    return axiosInstance.post(`${updateLinkBreakers}${params}`, payload).then((res) => res);
}

export function fetchPanelsFilter(args) {
    return axiosInstance
        .get(`${getFiltersForEquipment}`, {
            params: _.pickBy(
                {
                    query_collection: 'panels',
                    building_id: args.bldgId,
                },
                _.identity
            ),
        })
        .then((res) => {
            return res.data;
        });
}
