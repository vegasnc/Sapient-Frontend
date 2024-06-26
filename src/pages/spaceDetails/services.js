import axiosInstance from '../../services/axiosInstance';
import {
    getEnergyConsumptionBySpaceV2,
    getEnergyConsumptionSpaceByCategory,
    getSpaceMetadataV2,
    getEquipmentBySpace,
} from '../../services/Network';

export const fetchEnergyConsumptionSpaceByCategory = async (category, query) => {
    const { spaceId = '', bldgId = '', dateFrom = '', dateTo = '', tzInfo = 'US/Eastern' } = query;

    const params = `?space_ids=${spaceId}&building_id=${bldgId}&date_from=${dateFrom}&date_to=${dateTo}&tz_info=${tzInfo}`;

    return axiosInstance.get(`${getEnergyConsumptionSpaceByCategory}/${category}${params}`).then((res) => res?.data);
};

export const fetchEnergyConsumptionBySpace = async (query) => {
    const { spaceId = '', bldgId = '', dateFrom = '', dateTo = '', tzInfo = 'US/Eastern' } = query;

    const params = `?space_ids=${spaceId}&building_id=${bldgId}&date_from=${dateFrom}&date_to=${dateTo}&tz_info=${tzInfo}`;

    return axiosInstance.get(`${getEnergyConsumptionBySpaceV2}/${params}`).then((res) => res?.data);
};

export const fetchSpaceMetadata = async (query, spaceId) => {
    const { bldgId = '', dateFrom = '', dateTo = '', tzInfo = 'US/Eastern' } = query;

    const params = `?building_id=${bldgId}&date_from=${dateFrom}&date_to=${dateTo}&tz_info=${tzInfo}`;

    return axiosInstance.get(`${getSpaceMetadataV2}/${spaceId}${params}`).then((res) => res?.data);
};

export const fetchEquipmentBySpace = async (query, spaceId) => {
    const { bldgId = '', dateFrom = '', dateTo = '', tzInfo = 'US/Eastern', page = 1, size = 20, search } = query;
    const params = `?building_id=${bldgId}&space_ids=${spaceId}&ordered_by=consumption&date_from=${dateFrom}&date_to=${dateTo}&tz_info=${tzInfo}&page_no=${page}&page_size=${size}&search=${search}`;

    return axiosInstance.get(`${getEquipmentBySpace}${params}`).then((res) => res?.data);
};
