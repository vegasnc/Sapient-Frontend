import axiosInstance from '../../services/axiosInstance';
import { getSpaceListV2, getSpacesKPIV2 } from '../../services/Network';

export const fetchSpaceListV2 = async (query) => {
    const {
        bldgId = '',
        dateFrom = '',
        dateTo = '',
        tzInfo = 'US/Eastern',
        search = '',
        orderedBy,
        sortedBy,
        page = 1,
        size = 20,
    } = query;

    let params = `?building_id=${bldgId}&date_from=${dateFrom}&date_to=${dateTo}&tz_info=${tzInfo}`;

    if (page) params += `&page_no=${page}`;

    if (size) params += `&page_size=${size}`;

    if (search) params += `&search=${search}`;

    if (orderedBy && sortedBy) {
        params += `&ordered_by=${orderedBy}&sort_by=${sortedBy}`;
    }

    return axiosInstance.get(`${getSpaceListV2}${params}`).then((res) => res?.data);
};

export const fetchKPISpaceV2 = async (query) => {
    const { bldgId = '', dateFrom = '', dateTo = '', tzInfo = 'US/Eastern', orderedBy = 'consumption' } = query;

    const params = `?building_id=${bldgId}&date_from=${dateFrom}&date_to=${dateTo}&tz_info=${tzInfo}&ordered_by=${orderedBy}`;

    return axiosInstance.get(`${getSpacesKPIV2}${params}`).then((res) => res?.data);
};
