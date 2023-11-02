import _ from 'lodash';
import axiosInstance from './axiosInstance';

import {
    generalEquipments,
    deleteEquipment,
    createEquipment,
    getFiltersForEquipment,
    getEndUseId,
    getLocation,
    getMetadata,
} from './Network';

export function getEqupmentDataRequest(
    pageSize,
    pageNo,
    bldgId,
    search,
    equipmentTypeFilterString,
    endUseFilterString,
    macAddressFilterString,
    locationTypeFilterString,
    floorTypeFilterString,
    spaceTypeFilterString,
    tagsFilterString,
    getParams,
    withPagination
) {
    const searchData = encodeURIComponent(search);
    let params = `?building_id=${bldgId}&equipment_search=${searchData}`;
    if (withPagination) {
        params += `&page_size=${pageSize}&page_no=${pageNo}`;
    }
    if (getParams.order_by && getParams.sort_by) {
        params += `&ordered_by=${getParams.order_by}&sort_by=${getParams.sort_by}`;
    }

    const filteredData = _.pickBy(
        {
            floor_id: floorTypeFilterString,
            space_id: spaceTypeFilterString,
            tags: tagsFilterString,
            equipment_types: equipmentTypeFilterString,
            device_id: macAddressFilterString,
            ...getParams,
        },
        _.identity
    );
    if (endUseFilterString.length) {
        filteredData['end_uses'] = endUseFilterString;
    }

    return axiosInstance
        .post(`${generalEquipments}${params}`, {
            ...filteredData,
        })
        .then((res) => {
            return res;
        });
}

export function getMetadataRequest(bldgId) {
    let params = `?building_id=${bldgId}`;

    return axiosInstance.get(`${getMetadata}${params}`).then((res) => {
        return res.data;
    });
}

export function getUnlinkedSocketRules(
    pageSize,
    pageNo,
    ruleId,
    activeBuildingId,
    equpimentTypeFilterString,
    macTypeFilterString,
    locationTypeFilterString,
    sensorTypeFilterString,
    floorTypeFilterString,
    spaceTypeFilterString,
    spaceTypeTypeFilterString,
    getParams
) {
    let params = `?page_size=${pageSize}&page_no=${pageNo}&rule_id=${ruleId}&building_id=${activeBuildingId}&equipment_types=${encodeURIComponent(
        equpimentTypeFilterString
    )}&sensor_number=${encodeURIComponent(sensorTypeFilterString)}`;

    if (pageSize === 0) {
        return;
    }

    return axiosInstance
        .get(`${generalEquipments}${params}`, {
            params: _.pickBy(
                {
                    floor_id: floorTypeFilterString,
                    space_id: spaceTypeFilterString,
                    space_type_id: spaceTypeTypeFilterString,
                    mac_address: macTypeFilterString,
                    ...getParams,
                },
                _.identity
            ),
        })
        .then((res) => {
            return res;
        });
}

export function deleteEquipmentRequest(bldgId, equipmentIdData) {
    let params = `?equipment_id=${equipmentIdData}&building_id=${bldgId}`;
    return axiosInstance
        .delete(`${deleteEquipment}${params}`)
        .then((res) => {
            return res;
        })
        .catch((err) => {
            throw new Error(err);
        });
}
export function addNewEquipment(bldgId, createEqipmentData) {
    let params = Object.assign({}, createEqipmentData);
    params['building_id'] = bldgId;

    return axiosInstance.post(`${createEquipment}`, params).then((res) => {
        return res;
    });
}

/**
 * Request filters.
 * @param args = {sensor_search, equipment_types, mac_address, tags, floor_id, space_id, space_type_id, sensor_number};
 * @returns {Promise<AxiosResponse<any>>}
 */
export function getFiltersForEquipmentRequest(args) {
    const macAddressArr = args?.deviceMacAddress;
    const macAddressQuery = macAddressArr ? macAddressArr.join('+') : null;
    return axiosInstance
        .get(`${getFiltersForEquipment}`, {
            params: _.pickBy(
                {
                    query_collection: 'equipment',
                    building_id: args.bldgId,
                    mac_address: macAddressQuery,
                    equipment_types:args.equipmentTypeFilterString? encodeURI(args.equipmentTypeFilterString?.join('+')):null,
                    end_use: args.endUseFilterString,
                    floor_id: encodeURI(args.floorTypeFilterString?.join('+')),
                    space_id: encodeURI(args.spaceTypeFilterString?.join('+')),
                    tags: args.tagsFilterString,
                },
                _.identity
            ),
        })
        .then((res) => {
            return res.data;
        });
}

export function getEndUseDataRequest() {
    return axiosInstance.get(`${getEndUseId}`).then((res) => {
        return res.data;
    });
}
export function getLocationDataRequest(bldgId) {
    return axiosInstance.get(`${getLocation}/${bldgId}`).then((res) => {
        return res.data;
    });
}
