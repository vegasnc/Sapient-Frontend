import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Row, Col } from 'reactstrap';
import useCSVDownload from '../../../sharedComponents/hooks/useCSVDownload';
import moment from 'moment';
import Typography from '../../../sharedComponents/typography';
import { UncontrolledTooltip } from 'reactstrap';
import Modal from 'react-bootstrap/Modal';
import { ComponentStore } from '../../../store/ComponentStore';
import { BuildingStore } from '../../../store/BuildingStore';
import { BreadcrumbStore } from '../../../store/BreadcrumbStore';
import Button from '../../../sharedComponents/button/Button';
import { getEquipmentTableCSVExport } from '../../../utils/tablesExport';
import 'react-datepicker/dist/react-datepicker.css';
import _ from 'lodash';
import { Badge } from '../../../sharedComponents/badge';
import { FILTER_TYPES } from '../../../sharedComponents/dataTableWidget/constants';
import { DataTableWidget } from '../../../sharedComponents/dataTableWidget';
import { allEquipmentDataGlobal, buildingData, equipmentDataGlobal } from '../../../store/globalState';
import { useAtom } from 'jotai';
import { useParams } from 'react-router-dom';
import { userPermissionData } from '../../../store/globalState';
import EquipChartModal from '../../chartModal/EquipChartModal';
import './style.scss';
import {
    getEqupmentDataRequest,
    deleteEquipmentRequest,
    getFiltersForEquipmentRequest,
    getLocationDataRequest,
    getMetadataRequest,
} from '../../../services/equipment';
import { ReactComponent as PlusSVG } from '../../../assets/icon/plus.svg';
import Brick from '../../../sharedComponents/brick';
import AddEquipment from './AddEquipment';
import { UserStore } from '../../../store/UserStore';
import { pageListSizes } from '../../../helpers/helpers';
import { updateBuildingStore } from '../../../helpers/updateBuildingStore';
import SkeletonLoader from '../../../components/SkeletonLoader';

const Equipment = () => {
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const [equipmentFilter, setEquipmentFilter] = useState({});
    const [selectedModalTab, setSelectedModalTab] = useState(1);

    const [showEquipmentChart, setShowEquipmentChart] = useState(false);
    const handleChartOpen = () => setShowEquipmentChart(true);
    const handleChartClose = () => setShowEquipmentChart(false);

    const [isProcessing, setIsProcessing] = useState(false);
    const [isEquipDataFetched, setIsEquipDataFetched] = useState(true);

    const [selectedTab, setSelectedTab] = useState(0);
    const { bldgId } = useParams();
    const [buildingListData] = useAtom(buildingData);
    const bldgName = BuildingStore.useState((s) => s.BldgName);
    const [generalEquipmentData, setGeneralEquipmentData] = useState([]);
    const [DuplicateGeneralEquipmentData, setDuplicateGeneralEquipmentData] = useState([]);
    const [onlineEquipData, setOnlineEquipData] = useState([]);
    const [offlineEquipData, setOfflineEquipData] = useState([]);
    const [equipmentTypeData, setEquipmentTypeData] = useState([]);

    const [createEquipmentData, setCreateEquipmentData] = useState({
        name: '',
        equipment_type: '',
        end_use: '',
        space_id: '',
    });

    const [locationData, setLocationData] = useState([]);
    const [endUseData, setEndUseData] = useState([]);
    const [preparedEndUseData, setPreparedEndUseData] = useState({});
    const [pageSize, setPageSize] = useState(20);
    const [pageNo, setPageNo] = useState(1);
    const [isCSVDownloading, setDownloadingCSVData] = useState(false);
    const [showDeleteEquipmentModal, setShowDeleteEquipmentModal] = useState(false);
    const [rowToDelete, setRowToDelete] = useState();
    const [isDeleting, setIsDeleting] = useState(false);
    const [allSearchData, setAllSearchData] = useState([]);
    const [selectedOption, setSelectedOption] = useState([]);
    const [sortBy, setSortBy] = useState({});

    const [search, setSearch] = useState('');

    const [equipmentTypeDataAll, setEquipmentTypeDataAll] = useState([]);
    const [endUseDataNow, setEndUseDataNow] = useState([]);
    const [locationDataNow, setLocationDataNow] = useState([]);
    const addEquimentType = () => {
        const preparedData = [];
        equipmentTypeData.map((item) => {
            preparedData.push({
                value: `${item?.equipment_id}`,
                label: `${item?.equipment_type} (${item?.end_use_name})`,
                end_use_id: `${item?.end_use_id}`,
            });
        });
        setEquipmentTypeDataAll(preparedData);
    };

    const addEndUseType = () => {
        endUseData.map((item) => {
            setEndUseDataNow((el) => [...el, { value: `${item?.end_use_id}`, label: `${item?.name}` }]);
        });
    };

    const addLocationType = () => {
        const preparedData = [];

        locationData.map((item) => {
            preparedData.push({ value: `${item?.location_id}`, label: `${item?.location_name}` });
        });
        setLocationDataNow(preparedData);
    };

    useEffect(() => {
        if (equipmentTypeData) {
            addEquimentType();
        }
    }, [equipmentTypeData]);

    useEffect(() => {
        if (endUseData) {
            addEndUseType();
        }
    }, [endUseData]);

    useEffect(() => {
        if (locationData) {
            setLocationDataNow([]);
            addLocationType();
        }
    }, [locationData]);

    const isLoadingRef = useRef(false);

    const handleChange = (key, value) => {
        let obj = Object.assign({}, createEquipmentData);
        if (key === 'equipment_type') {
            let endUseObj = equipmentTypeData.find((record) => record?.equipment_id === value);
            obj['end_use'] = endUseObj.end_use_id;
        }
        obj[key] = value;
        setCreateEquipmentData(obj);
    };

    const renderLocation = useCallback((row, childrenTemplate) => {
        const location = [row.installed_floor, row.installed_space];

        return childrenTemplate(location.join(' - '));
    }, []);
    const [totalItems, setTotalItems] = useState(0);
    const [totalItemsSearched, setTotalItemsSearched] = useState(0);
    const [filterOptions, setFilterOptions] = useState([]);
    const { download } = useCSVDownload();

    const [equipmentTypeFilterString, setEquipmentTypeFilterString] = useState('');
    const [panelNameFilterString, setPanelNameFilterString] = useState('');
    const [cdModelInstalledNameString, setCdModelInstalledNameString] = useState('');
    const [breakerNumberString, setBreakerNumberString] = useState('');
    const [breakerRatedAmpsString, setBreakerRatedAmpsString] = useState('');
    const [endUseFilterString, setEndUseFilterString] = useState('');

    const [deviceIdFilterString, setDeviceIdFilterString] = useState('');
    const [deviceMacAddress, setDeviceMacAddress] = useState('');
    const [locationTypeFilterString, setLocationTypeFilterString] = useState('');
    const [isLoadingEndUseData, setIsLoadingEndUseData] = useState(true);
    const [isFilterFetching, setFetchingFilters] = useState(false);

    const [floorString, setFloorString] = useState([]);
    const [spaceString, setSpaceString] = useState([]);

    const [tagsFilterString, setTagsTypeFilterString] = useState('');

    const [equpimentDataNow, setEqupimentDataNow] = useAtom(equipmentDataGlobal);
    const [allEqupimentDataNow, setAllEqupimentDataNow] = useAtom(allEquipmentDataGlobal);

    const currentRow = () => {
        if (selectedTab === 0) {
            return generalEquipmentData;
        } else if (selectedTab === 1) {
            return onlineEquipData;
        } else if (selectedTab === 2) {
        }
        return offlineEquipData;
    };

    const renderSensors = useCallback((row) => {
        return (
            <div className="sensors-row-content">
                {row.sensor_number.length === 0 ? (
                    <Typography.Body>-</Typography.Body>
                ) : (
                    <>
                        {row.sensor_number.map((el) => {
                            return (
                                <Badge
                                    text={
                                        <span className="gray-950">
                                            {el}/{row.total_sensor}
                                        </span>
                                    }
                                />
                            );
                        })}
                    </>
                )}
            </div>
        );
    });

    const renderTags = useCallback((row) => {
        const slicedArr = row.tags.slice(1);
        return (
            <div className="tags-row-content">
                <Badge text={<span className="gray-950">{row.tags[0] ? row.tags[0] : 'none'}</span>} />
                {slicedArr?.length > 0 ? (
                    <>
                        <Badge
                            text={
                                <span className="gray-950" id={`tags-badge-${row.equipments_id}`}>
                                    +{slicedArr.length} more
                                </span>
                            }
                        />
                        <UncontrolledTooltip
                            placement="top"
                            target={`tags-badge-${row.equipments_id}`}
                            className="tags-tooltip">
                            {slicedArr.map((el) => {
                                return <Badge text={<span className="gray-950">{el}</span>} />;
                            })}
                        </UncontrolledTooltip>
                    </>
                ) : null}
            </div>
        );
    });

    const fetchEquipmentData = async () => {
        isLoadingRef.current = true;
        setIsEquipDataFetched(true);
        const sorting = sortBy.method &&
            sortBy.name && {
                order_by: sortBy.name,
                sort_by: sortBy.method,
            };

        await getEqupmentDataRequest(
            panelNameFilterString,
            cdModelInstalledNameString,
            breakerNumberString,
            breakerRatedAmpsString,
            pageSize,
            pageNo,
            bldgId,
            search,
            equipmentTypeFilterString,
            endUseFilterString,
            deviceIdFilterString,
            locationTypeFilterString,
            floorString,
            spaceString,
            tagsFilterString,
            {
                ...sorting,
            },
            true
        )
            .then((res) => {
                let responseData = res.data;
                setTotalItems(responseData.total_data);

                setGeneralEquipmentData(responseData.data);
                setDuplicateGeneralEquipmentData(responseData.data);
                let onlineEquip = [];
                let offlineEquip = [];
                responseData.data.forEach((record) => {
                    if (record.status) {
                        onlineEquip.push(record);
                    }
                    if (!record.status) {
                        offlineEquip.push(record);
                    }
                });
                setOnlineEquipData(onlineEquip);
                setOfflineEquipData(offlineEquip);
                setIsEquipDataFetched(false);
                isLoadingRef.current = false;
            })
            .catch((error) => {
                setIsEquipDataFetched(false);
                isLoadingRef.current = false;
                handleChartClose();
            });
    };

    const addEquimentData = () => {
        generalEquipmentData.map((item) => {
            if (item?.device_type === 'active') {
                setEqupimentDataNow((el) => [...el, item?.equipments_id]);
            }
            setAllEqupimentDataNow((el) => [...el, item?.equipments_id]);
        });
    };

    useEffect(() => {
        addEquimentData();
        addEquimentType();
    }, [generalEquipmentData]);

    useEffect(() => {
        fetchMetadata();
        fetchLocationData();
    }, [bldgId, pageSize]);

    const fetchMetadata = async () => {
        setIsLoadingEndUseData(true);
        await getMetadataRequest(bldgId)
            .then((res) => {
                const { end_uses, equipment_type } = res.data;
                const prepareEndUseType = end_uses.reduce((acc, el) => {
                    acc[`${el.end_use_id}`] = el.name;
                    return acc;
                }, {});
                setEquipmentTypeData(equipment_type);
                setEndUseData(end_uses);
                setPreparedEndUseData(prepareEndUseType);
            })
            .finally(() => {
                setIsLoadingEndUseData(false);
            });
    };

    const fetchLocationData = async () => {
        await getLocationDataRequest(bldgId)
            .then((res) => {
                setLocationData(res);
            })
            .catch((error) => {});
    };

    useEffect(() => {
        if (bldgId && buildingListData.length !== 0) {
            const bldgObj = buildingListData.find((el) => el?.building_id === bldgId);
            if (bldgObj?.building_id)
                updateBuildingStore(
                    bldgObj?.building_id,
                    bldgObj?.building_name,
                    bldgObj?.timezone,
                    bldgObj?.plug_only
                );
        }
    }, [buildingListData, bldgId]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pageNo, pageSize]);

    useEffect(() => {
        const updateBreadcrumbStore = () => {
            BreadcrumbStore.update((bs) => {
                let newList = [
                    {
                        label: 'Equipment',
                        path: '/settings/equipment',
                        active: true,
                    },
                ];
                bs.items = newList;
            });
            ComponentStore.update((s) => {
                s.parent = 'building-settings';
            });
        };
        window.scrollTo(0, 0);
        updateBreadcrumbStore();
    }, []);

    const [userPermission] = useAtom(userPermissionData);

    const filterHandler = (setter, options) => {
        setter(options.map(({ value }) => value));
        setPageNo(1);
    };

    const filterLabelHandler = (setter, options) => {
        setter(options.map(({ label }) => label));
        setPageNo(1);
    };

    const renderEndUseCategory = (row) => {
        return (
            <Typography.Body size={Typography.Sizes.md}>
                {row.end_use_name !== '' ? row.end_use_name : '-'}
            </Typography.Body>
        );
    };

    const handleOpenEditEquipment = (row) => {
        setEquipmentFilter({
            equipment_id: row?.equipments_id,
            equipment_name: row?.equipments_name,
            device_type: row?.device_type,
        });
        handleChartOpen();
    };
    const renderEquipmentsName = (row) => {
        return (
            <Typography.Link
                size={Typography.Sizes.md}
                className="mouse-pointer"
                onClick={() => handleOpenEditEquipment(row)}>
                {row.equipments_name !== '' ? row.equipments_name : '-'}
            </Typography.Link>
        );
    };
    const renderPanel = (row) => {
        return (
            <Typography.Body size={Typography.Sizes.md}>{row.panel_name !== '' ? row.panel_name : '-'}</Typography.Body>
        );
    };

    const renderCTAmp = (row) => {
        return (
            <Typography.Body size={Typography.Sizes.md}>
                {row.ct_model_installed !== '' ? row.ct_model_installed : '-'}
            </Typography.Body>
        );
    };

    const renderRatedAmps = (row) => {
        return <Typography.Body size={Typography.Sizes.md}>{row.breaker_rated_amps[0]}</Typography.Body>;
    };

    const renderBreaker = (row) => {
        const res = row.breaker_number && row.breaker_number.length ? row.breaker_number.join(', ') : '';
        return <Typography.Body size={Typography.Sizes.md}>{res !== '' ? res : '-'}</Typography.Body>;
    };

    const getFilters = async () => {
        setFetchingFilters(true);
        const filters = await getFiltersForEquipmentRequest({
            bldgId,
            deviceMacAddress,
            equipmentTypeFilterString,
            endUseFilterString,
            floorTypeFilterString: floorString,
            spaceTypeFilterString: spaceString,
            tagsFilterString,
            panelNameFilterString,
            cdModelInstalledNameString,
            breakerNumberString,
            breakerRatedAmpsString,
        });

        filters.data.forEach((filterOptions) => {
            const sortedFloors = filterOptions?.installed_floor
                .slice()
                .sort((a, b) => a.floor_name.localeCompare(b.floor_name));
            const sortedSpaces = filterOptions?.installed_space
                .slice()
                .sort((a, b) => a.space_name.localeCompare(b.space_name));

            if (filterOptions?.breaker_number.length > 1) filterOptions.breaker_number.sort((a, b) => a - b);
            if (filterOptions?.breaker_rated_amps.length > 1) filterOptions.breaker_rated_amps.sort((a, b) => a - b);
            if (filterOptions?.tags.length > 1) filterOptions.tags.sort((a, b) => b.localeCompare(a));
            if (filterOptions?.ct_model_installed_name.length > 1)
                filterOptions.ct_model_installed_name.sort((a, b) =>
                    a.ct_model_installed_name.localeCompare(b.ct_model_installed_name)
                );
            if (filterOptions?.panel_name.length > 1)
                filterOptions.panel_name.sort((a, b) => a.panel_name.localeCompare(b.panel_name));
            if (filterOptions?.mac_address.length > 1)
                filterOptions.mac_address.sort((a, b) => a.device_mac_address.localeCompare(b.device_mac_address));
            if (filterOptions?.end_use.length > 1)
                filterOptions.end_use.sort((a, b) => a.end_use_name.localeCompare(b.end_use_name));
            if (filterOptions?.equipment_type.length > 1)
                filterOptions.equipment_type.sort((a, b) => a.equipment_type_name.localeCompare(b.equipment_type_name));

            if (tagsFilterString?.length === 0 || tagsFilterString?.includes('none'))
                filterOptions.tags.unshift('none');
            if (deviceIdFilterString?.length === 0 || deviceIdFilterString?.includes('none'))
                filterOptions.mac_address.unshift({ device_id: 'none', device_mac_address: 'none' });
            if (panelNameFilterString?.length === 0 || panelNameFilterString?.includes('none'))
                filterOptions.panel_name.unshift({ panel_id: 'none', panel_name: 'none' });
            if (breakerNumberString?.length === 0 || breakerNumberString?.includes('none'))
                filterOptions.breaker_number.unshift('none');

            if ((floorString?.length === 0 && spaceString?.length === 0) || floorString?.includes('none'))
                sortedFloors.unshift({ floor_id: 'none', floor_name: 'none' });
            if ((floorString?.length === 0 && spaceString?.length === 0) || spaceString?.includes('none'))
                sortedSpaces.unshift({ space_id: 'none', space_name: 'none' });

            const filterOptionsFetched = [
                {
                    label: 'Equipment Type',
                    value: 'equipmentType',
                    placeholder: 'All Equipment Types',
                    filterType: FILTER_TYPES.MULTISELECT,
                    filterOptions: _.chain(filterOptions?.equipment_type)
                        .sortBy('equipment_type_name')
                        .map((filterItem) => ({
                            value: filterItem?.equipment_type_id,
                            label: filterItem?.equipment_type_name,
                        }))
                        .value(),
                    onClose: (options) => filterHandler(setEquipmentTypeFilterString, options),
                    onDelete: () => {
                        setPageNo(1);
                        setSelectedOption([]);
                        setEquipmentTypeFilterString('');
                    },
                },
                {
                    label: 'End use Category',
                    value: 'end_use',
                    placeholder: 'All End use',
                    filterType: FILTER_TYPES.MULTISELECT,
                    filterOptions: _.chain(filterOptions?.end_use)
                        .sortBy('end_use_name')
                        .map((filterItem) => ({
                            value: filterItem?.end_use_id,
                            label: filterItem?.end_use_name,
                        }))
                        .value(),
                    onClose: (options) => filterHandler(setEndUseFilterString, options),
                    onDelete: () => {
                        setPageNo(1);
                        setSelectedOption([]);
                        setEndUseFilterString('');
                    },
                },
                {
                    label: 'Device ID',
                    value: 'mac_address',
                    placeholder: 'Select Device ID',
                    filterType: FILTER_TYPES.MULTISELECT,
                    filterOptions: _.chain(filterOptions?.mac_address)
                        .sortBy('device_mac_address')
                        .map((filterItem) => ({
                            value: filterItem?.device_id,
                            label: filterItem?.device_mac_address,
                        }))
                        .value(),
                    onClose: (options) => {
                        filterHandler(setDeviceIdFilterString, options);
                        filterLabelHandler(setDeviceMacAddress, options);
                    },
                    onDelete: () => {
                        setPageNo(1);
                        setSelectedOption([]);
                        setDeviceIdFilterString('');
                        setDeviceMacAddress('');
                    },
                },
                {
                    label: 'Tag',
                    value: 'tag',
                    placeholder: 'All tags',
                    filterType: FILTER_TYPES.MULTISELECT,
                    filterOptions: _.chain(filterOptions?.tags)
                        .map((filterItem) => ({
                            value: filterItem,
                            label: filterItem,
                        }))
                        .sortBy('label')
                        .value(),
                    onClose: (options) => filterHandler(setTagsTypeFilterString, options),
                    onDelete: () => {
                        setPageNo(1);
                        setTagsTypeFilterString('');
                    },
                },
                {
                    label: 'Floors',
                    value: 'floor',
                    placeholder: 'All Floors',
                    filterType: FILTER_TYPES.MULTISELECT,
                    filterOptions: _.chain(sortedFloors)
                        .sortBy('floor_name')
                        .map((filterItem) => ({
                            value: filterItem?.floor_id,
                            label: filterItem?.floor_name,
                        }))
                        .value(),
                    onClose: (options) => {
                        let opt = options;
                        if (opt.length !== 0) {
                            let sensors = [];
                            for (let i = 0; i < opt.length; i++) {
                                sensors.push(opt[i].value);
                            }
                            setFloorString(sensors);
                        }
                    },
                    onDelete: () => {
                        setPageNo(1);
                        setFloorString([]);
                    },
                },
                {
                    label: 'Spaces',
                    value: 'space',
                    placeholder: 'All Spaces',
                    filterType: FILTER_TYPES.MULTISELECT,
                    filterOptions: _.chain(sortedSpaces)
                        .sortBy('space_name')
                        .map((filterItem) => ({
                            value: filterItem?.space_id,
                            label: filterItem?.space_name,
                        }))
                        .value(),
                    onClose: (options) => {
                        let opt = options;
                        if (opt.length !== 0) {
                            let sensors = [];
                            for (let i = 0; i < opt.length; i++) {
                                sensors.push(opt[i].value);
                            }
                            setSpaceString(sensors);
                        }
                    },
                    onDelete: () => {
                        setPageNo(1);
                        setSpaceString([]);
                    },
                },
                {
                    label: 'Panel',
                    value: 'panel_name',
                    placeholder: 'All Panels',
                    filterType: FILTER_TYPES.MULTISELECT,
                    filterOptions: _.chain(filterOptions?.panel_name)
                        .sortBy('panel_name')
                        .map((filterItem) => ({
                            value: filterItem?.panel_id,
                            label: filterItem?.panel_name,
                        }))
                        .value(),
                    onClose: (options) => filterHandler(setPanelNameFilterString, options),
                    onDelete: () => {
                        setPageNo(1);
                        setSelectedOption([]);
                        setPanelNameFilterString('');
                    },
                },
                {
                    label: 'CT Amp Rating',
                    value: 'ct_model_installed_name',
                    placeholder: 'All CT Amp Ratings',
                    filterType: FILTER_TYPES.MULTISELECT,
                    filterOptions: _.chain(filterOptions?.ct_model_installed_name)
                        .sortBy('ct_model_installed_name')
                        .map((el) => ({
                            value: el?.ct_model_installed_id,
                            label: el?.ct_model_installed_name,
                        }))
                        .value(),
                    onClose: (options) => filterHandler(setCdModelInstalledNameString, options),
                    onDelete: () => {
                        setPageNo(1);
                        setSelectedOption([]);
                        setCdModelInstalledNameString('');
                    },
                },
                {
                    label: 'Breaker #s',
                    value: 'breaker_number',
                    placeholder: 'All Breaker #s',
                    filterType: FILTER_TYPES.MULTISELECT,
                    filterOptions: _.chain(filterOptions?.breaker_number)
                        .map((filterItem) => ({
                            value: filterItem,
                            label: filterItem,
                        }))
                        .sortBy('label')
                        .value(),
                    onClose: (options) => filterHandler(setBreakerNumberString, options),
                    onDelete: () => {
                        setPageNo(1);
                        setSelectedOption([]);
                        setBreakerNumberString('');
                    },
                },
                {
                    label: 'Rated Amps',
                    value: 'breaker_rated_amps',
                    placeholder: 'All Rated Amps',
                    filterType: FILTER_TYPES.MULTISELECT,
                    filterOptions: _.chain(filterOptions?.breaker_rated_amps)
                        .map((filterItem) => ({
                            value: filterItem,
                            label: filterItem,
                        }))
                        .sortBy('label')
                        .value(),
                    onClose: (options) => filterHandler(setBreakerRatedAmpsString, options),
                    onDelete: () => {
                        setPageNo(1);
                        setSelectedOption([]);
                        setBreakerRatedAmpsString('');
                    },
                },
            ];

            setFilterOptions(filterOptionsFetched);
        });
        setFetchingFilters(false);
    };

    useEffect(() => {
        getFilters();
        fetchEquipmentData();
    }, [
        search,
        bldgId,
        pageSize,
        pageNo,
        sortBy,
        deviceMacAddress,
        deviceIdFilterString,
        equipmentTypeFilterString,
        endUseFilterString,
        locationTypeFilterString,
        floorString,
        spaceString,
        tagsFilterString,
        panelNameFilterString,
        cdModelInstalledNameString,
        breakerNumberString,
        breakerRatedAmpsString,
    ]);

    const renderLastUsedCell = (row, childrenTemplate) => {
        const { last_used_data } = row;

        return childrenTemplate(last_used_data ? moment(last_used_data).fromNow() : '');
    };
    const deleteEquipmentFunc = async (row) => {
        setIsDeleting(true);
        await deleteEquipmentRequest(bldgId, row.equipments_id)
            .then((res) => {
                const response = res?.data;
                if (response?.success) {
                    UserStore.update((s) => {
                        s.showNotification = true;
                        s.notificationMessage = response?.message;
                        s.notificationType = 'success';
                    });
                    fetchEquipmentData();
                } else {
                    UserStore.update((s) => {
                        s.showNotification = true;
                        s.notificationMessage = response?.message
                            ? response?.message
                            : res
                            ? 'Unable to delete Equipment.'
                            : 'Unable to delete Equipment due to Internal Server Error!.';
                        s.notificationType = 'error';
                    });
                }
                setIsDeleting(false);
                setShowDeleteEquipmentModal(false);
            })
            .catch((error) => {
                alert(error);
                setShowDeleteEquipmentModal(false);
                setIsDeleting(false);
            });
    };

    const headerProps = [
        {
            name: 'Name',
            accessor: 'equipments_name',
            callbackValue: renderEquipmentsName,
            onSort: (method, name) => setSortBy({ method, name }),
        },
        {
            name: 'Equipment Type',
            accessor: 'equipments_type',
            onSort: (method, name) => setSortBy({ method, name }),
        },
        {
            name: 'End Use Category',
            accessor: 'end_use_name',
            callbackValue: renderEndUseCategory,
            onSort: (method, name) => setSortBy({ method, name }),
        },
        {
            name: 'Location',
            accessor: 'location',
            onSort: (method, name) => setSortBy({ method, name }),
        },
        {
            name: 'Tags',
            accessor: 'tags',
            callbackValue: renderTags,
            onSort: (method, name) => setSortBy({ method, name }),
        },
        {
            name: 'Sensors',
            accessor: 'sensor_number',
            callbackValue: renderSensors,
            onSort: (method, name) => setSortBy({ method, name }),
        },
        {
            name: 'Device ID',
            accessor: 'device_mac',
            onSort: (method, name) => setSortBy({ method, name }),
        },
        {
            name: 'Panel',
            accessor: 'panel_name',
            callbackValue: renderPanel,
            onSort: (method, name) => setSortBy({ method, name }),
        },
        {
            name: `Breaker #s`,
            accessor: 'breaker_number',
            callbackValue: renderBreaker,
            onSort: (method, name) => setSortBy({ method, name }),
        },
        {
            name: 'Rated Amps',
            accessor: 'breaker_rated_amps',
            callbackValue: renderRatedAmps,
            onSort: (method, name) => setSortBy({ method, name }),
        },
        {
            name: 'CT Amp Rating',
            accessor: 'ct_model_installed',
            callbackValue: renderCTAmp,
            onSort: (method, name) => setSortBy({ method, name }),
        },
    ];

    const handleDownloadCsv = async () => {
        setDownloadingCSVData(true);
        const sorting = sortBy.method &&
            sortBy.name && {
                order_by: sortBy.name,
                sort_by: sortBy.method,
            };

        await getEqupmentDataRequest(
            panelNameFilterString,
            cdModelInstalledNameString,
            breakerNumberString,
            breakerRatedAmpsString,
            pageSize,
            pageNo,
            bldgId,
            search,
            equipmentTypeFilterString,
            deviceIdFilterString,
            locationTypeFilterString,
            floorString,
            spaceString,
            tagsFilterString,
            {
                ...sorting,
            },
            false
        )
            .then((res) => {
                let response = res.data;
                download(
                    `${bldgName}_Equipments_${new Date().toISOString().split('T')[0]}`,
                    getEquipmentTableCSVExport(response.data, headerProps, preparedEndUseData)
                );
                setIsEquipDataFetched(false);
            })
            .catch((error) => {
                setIsProcessing(false);
            })
            .finally(() => {
                setDownloadingCSVData(false);
            });
    };
    const handleDeleteRowClicked = (row) => {
        setShowDeleteEquipmentModal(true);
        setRowToDelete(row);
    };

    const handleAbleToDeleteRow = (row) => {
        return row.device_type !== 'active';
    };

    return (
        <div>
            <Row>
                <Col lg={12}>
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <Typography.Header size={Typography.Sizes.lg}>Equipment</Typography.Header>
                        </div>
                        {userPermission?.user_role === 'admin' ||
                        userPermission?.permissions?.permissions?.building_equipment_permission?.create ? (
                            <div className="d-flex">
                                <Button
                                    label={'Add Equipment'}
                                    size={Button.Sizes.md}
                                    type={Button.Type.primary}
                                    onClick={() => {
                                        handleShow();
                                        setCreateEquipmentData({
                                            name: '',
                                            equipment_type: '',
                                            end_use: '',
                                            space_id: '',
                                        });
                                    }}
                                    icon={<PlusSVG />}
                                />
                            </div>
                        ) : null}
                    </div>
                </Col>
            </Row>
            <Brick sizeInRem={1.5} />
            <Row>
                <Col lg={12}>
                    <DataTableWidget
                        isLoading={isEquipDataFetched || isLoadingEndUseData}
                        isFilterLoading={isFilterFetching}
                        isLoadingComponent={<SkeletonLoader noOfColumns={headerProps.length + 1} noOfRows={15} />}
                        id="equipment"
                        onSearch={(query) => {
                            setPageNo(1);
                            setSearch(query);
                        }}
                        rows={currentRow()}
                        isDeletable={(row) => handleAbleToDeleteRow(row)}
                        searchResultRows={generalEquipmentData}
                        filterOptions={filterOptions}
                        onDeleteRow={
                            userPermission?.user_role === 'admin' ||
                            userPermission?.permissions?.permissions?.account_buildings_permission?.edit
                                ? (event, id, row) => handleDeleteRowClicked(row)
                                : null
                        }
                        onEditRow={
                            userPermission?.user_role === 'admin' ||
                            userPermission?.permissions?.permissions?.account_buildings_permission?.edit
                                ? (record, id, row) => handleOpenEditEquipment(row)
                                : null
                        }
                        onDownload={() => handleDownloadCsv()}
                        isCSVDownloading={isCSVDownloading}
                        headers={headerProps}
                        buttonGroupFilterOptions={[]}
                        onPageSize={setPageSize}
                        onChangePage={setPageNo}
                        pageSize={pageSize}
                        currentPage={pageNo}
                        pageListSizes={pageListSizes}
                        totalCount={(() => {
                            if (search) {
                                return totalItemsSearched;
                            }
                            if (selectedTab === 0) {
                                return totalItems;
                            }

                            return 0;
                        })()}
                    />
                </Col>
            </Row>
            <Modal
                show={showDeleteEquipmentModal}
                onHide={() => setShowDeleteEquipmentModal(false)}
                centered
                backdrop="static"
                keyboard={false}>
                <Modal.Body>
                    <div className="mb-4">
                        <h5 className="unlink-heading-style ml-2 mb-0">Delete Equipment</h5>
                    </div>
                    <div className="m-2">
                        <div className="unlink-alert-styling mb-1">Are you sure you want to delete the Equipment?</div>
                    </div>
                    <div className="panel-edit-model-row-style ml-2 mr-2"></div>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        label="Cancel"
                        size={Button.Sizes.lg}
                        type={Button.Type.secondaryGrey}
                        onClick={() => setShowDeleteEquipmentModal(false)}
                    />

                    <Button
                        label={isDeleting ? 'Deleting' : 'Delete'}
                        size={Button.Sizes.lg}
                        type={Button.Type.primaryDistructive}
                        onClick={() => {
                            deleteEquipmentFunc(rowToDelete);
                        }}
                    />
                </Modal.Footer>
            </Modal>

            <EquipChartModal
                showEquipmentChart={showEquipmentChart}
                handleChartClose={handleChartClose}
                selectedEquipObj={equipmentFilter}
                fetchEquipmentData={fetchEquipmentData}
                selectedTab={selectedModalTab}
                setSelectedTab={setSelectedModalTab}
                activePage="equipment"
            />

            <AddEquipment
                isAddEquipModalOpen={show}
                closeModal={handleClose}
                equipmentTypeDataAll={equipmentTypeDataAll}
                endUseDataNow={endUseDataNow}
                locationDataNow={locationDataNow}
                isProcessing={isProcessing}
                setIsProcessing={setIsProcessing}
                fetchEquipmentData={fetchEquipmentData}
                bldgId={bldgId}
            />
        </div>
    );
};

export default Equipment;
