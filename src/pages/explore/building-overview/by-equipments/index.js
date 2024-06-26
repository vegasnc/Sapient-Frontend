import React, { useState, useEffect, useCallback } from 'react';
import _ from 'lodash';
import { useAtom } from 'jotai';
import { Row, UncontrolledTooltip, Progress, Spinner } from 'reactstrap';

import { UserStore } from '../../../../store/UserStore';
import { buildingData } from '../../../../store/globalState';
import { DateRangeStore } from '../../../../store/DateRangeStore';
import { BuildingStore } from '../../../../store/BuildingStore';
import { ComponentStore } from '../../../../store/ComponentStore';
import { BreadcrumbStore } from '../../../../store/BreadcrumbStore';
import { updateBuildingStore } from '../../../../helpers/updateBuildingStore';
import useCSVDownload from '../../../../sharedComponents/hooks/useCSVDownload';

import SkeletonLoader from '../../../../components/SkeletonLoader';
import EquipChartModal from '../../../chartModal/EquipChartModal';
import Brick from '../../../../sharedComponents/brick';
import { Badge } from '../../../../sharedComponents/badge';
import { Checkbox } from '../../../../sharedComponents/form/checkbox';
import { DataTableWidget } from '../../../../sharedComponents/dataTableWidget';
import { TrendsBadge } from '../../../../sharedComponents/trendsBadge';
import Typography from '../../../../sharedComponents/typography';

import ExploreChart from '../../../../sharedComponents/exploreChart/ExploreChart';
import ExploreCompareChart from '../../../../sharedComponents/exploreCompareChart/ExploreCompareChart';

import {
    handleAPIRequestBody,
    dateTimeFormatForHighChart,
    formatConsumptionValue,
    formatXaxisForHighCharts,
    getPastDateRange,
    pageListSizes,
} from '../../../../helpers/helpers';
import { EXPLORE_FILTER_TYPE } from '../../constants';
import { UNITS } from '../../../../constants/units';
import { isEmptyObject, truncateString, validateSeriesDataForEquipments } from '../../utils';
import { getExploreByEquipmentTableCSVExport } from '../../../../utils/tablesExport';
import { FILTER_TYPES } from '../../../../sharedComponents/dataTableWidget/constants';
import { updateBreadcrumbStore } from '../../../../helpers/updateBreadcrumbStore';

import { fetchExploreEquipmentList, fetchExploreEquipmentChart, fetchExploreFilter } from '../../../explore/services';

import '../../style.css';
import '../../styles.scss';

const ExploreByEquipments = (props) => {
    const {
        bldgId,
        selectedUnit,
        selectedConsumption,
        selectedConsumptionLabel,
        isInComparisonMode = false,
        setComparisonMode,
    } = props;

    const { download } = useCSVDownload();

    const [buildingListData] = useAtom(buildingData);
    const bldgName = BuildingStore.useState((s) => s.BldgName);
    const timeZone = BuildingStore.useState((s) => s.BldgTimeZone);

    const startDate = DateRangeStore.useState((s) => s.startDate);
    const endDate = DateRangeStore.useState((s) => s.endDate);
    const startTime = DateRangeStore.useState((s) => s.startTime);
    const endTime = DateRangeStore.useState((s) => s.endTime);
    const daysCount = DateRangeStore.useState((s) => +s.daysCount);

    const userPrefDateFormat = UserStore.useState((s) => s.dateFormat);
    const userPrefTimeFormat = UserStore.useState((s) => s.timeFormat);

    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState({});

    const [pageNo, setPageNo] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [totalItems, setTotalItems] = useState(0);
    const [isCSVDownloading, setDownloadingCSVData] = useState(false);

    const [selectedEquipIds, setSelectedEquipIds] = useState([]);
    const [filterObj, setFilterObj] = useState({});
    const [filterOptions, setFilterOptions] = useState([]);
    const [equipDataList, setEquipDataList] = useState([]);

    const [seriesData, setSeriesData] = useState([]);
    const [pastSeriesData, setPastSeriesData] = useState([]);

    const [isFiltersFetching, setFiltersFetching] = useState(false);
    const [isFetchingChartData, setFetchingChartData] = useState(false);
    const [isFetchingPastChartData, setFetchingPastChartData] = useState(false);
    const [isEquipDataFetching, setEquipDataFetching] = useState(false);

    const [checkedAll, setCheckedAll] = useState(false);
    const [deviceType, setDeviceType] = useState('');

    // Equipment Chart Modal
    const [showEquipmentChart, setShowEquipmentChart] = useState(false);
    const handleChartOpen = () => setShowEquipmentChart(true);
    const handleChartClose = () => setShowEquipmentChart(false);

    // Table Filters
    const [topConsumption, setTopConsumption] = useState(0);
    const [bottomConsumption, setBottomConsumption] = useState(0);
    const [topPerChange, setTopPerChange] = useState(0);
    const [neutralPerChange, setNeutralPerChange] = useState(0);
    const [bottomPerChange, setBottomPerChange] = useState(0);

    const [conAPIFlag, setConAPIFlag] = useState('');
    const [minConValue, set_minConValue] = useState(0);
    const [maxConValue, set_maxConValue] = useState(0);

    const [perAPIFlag, setPerAPIFlag] = useState('');
    const [minPerValue, set_minPerValue] = useState(0);
    const [maxPerValue, set_maxPerValue] = useState(0);

    const [selectedEquipType, setSelectedEquipType] = useState([]);
    const [selectedEndUse, setSelectedEndUse] = useState([]);
    const [selectedSpaceType, setSelectedSpaceType] = useState([]);
    const [selectedTags, setSelectedTags] = useState([]);
    const [selectedFloors, setSelectedFloors] = useState([]);
    const [selectedSpaces, setSelectedSpaces] = useState([]);
    const [selectedPanels, setSelectedPanels] = useState([]);
    const [selectedBreakers, setSelectedBreakers] = useState([]);
    const [selectedNotes, setSelectedNotes] = useState([]);

    const [topVal, setTopVal] = useState(0);
    const [bottomVal, setBottomVal] = useState(0);
    const [currentButtonId, setCurrentButtonId] = useState(0);
    const [isopened, setIsOpened] = useState(false);

    const [equipmentFilter, setEquipmentFilter] = useState({});
    const [selectedModalTab, setSelectedModalTab] = useState(0);

    const currentRow = () => {
        return equipDataList;
    };

    const renderConsumption = useCallback((row) => {
        return (
            <>
                <Typography.Body size={Typography.Sizes.sm}>
                    {`${formatConsumptionValue(Math.round(row?.consumption?.now / 1000))} ${UNITS.KWH}`}
                </Typography.Body>
                <Brick sizeInRem={0.375} />
                <Progress multi className="custom-progress-bar">
                    <Progress
                        bar
                        value={row?.consumption?.now}
                        max={row?.totalBldgUsage}
                        barClassName="custom-on-hour"
                    />
                    <Progress
                        bar
                        value={row?.consumption?.off_hours}
                        max={row?.totalBldgUsage}
                        barClassName="custom-off-hour"
                    />
                </Progress>
            </>
        );
    });

    const renderPerChange = useCallback((row) => {
        return (
            <TrendsBadge
                value={Math.abs(Math.round(row?.consumption?.change))}
                type={
                    row?.consumption?.change === 0
                        ? TrendsBadge.Type.NEUTRAL_TREND
                        : row?.consumption?.now < row?.consumption?.old
                        ? TrendsBadge.Type.DOWNWARD_TREND
                        : TrendsBadge.Type.UPWARD_TREND
                }
            />
        );
    });

    const renderBreakers = useCallback((row) => {
        return (
            <div className="breakers-row-content">
                {row?.breaker_number.length === 0 ? (
                    <Typography.Body>-</Typography.Body>
                ) : (
                    <Badge text={<span className="gray-950">{row?.breaker_number.join(', ')}</span>} />
                )}
            </div>
        );
    });

    const renderNotes = useCallback((row) => {
        let renderText = !row?.note || row?.note === '' ? '-' : row?.note;
        if (renderText?.length > 50) renderText = truncateString(renderText);

        return (
            <div style={{ maxWidth: '15rem' }}>
                <Typography.Body size={Typography.Sizes.md}>
                    {renderText}
                    {row?.note?.length > 50 && (
                        <>
                            <div
                                className="d-inline mouse-pointer"
                                id={`notes-badge-${row?.equipment_id}`}>{` ...`}</div>
                            <UncontrolledTooltip placement="top" target={`notes-badge-${row?.equipment_id}`}>
                                {row?.note}
                            </UncontrolledTooltip>
                        </>
                    )}
                </Typography.Body>
            </div>
        );
    });

    const renderTags = useCallback((row) => {
        const slicedArr = row?.tags.slice(1);
        return (
            <div className="tag-row-content">
                <Badge text={<span className="gray-950">{row?.tags[0] ? row?.tags[0] : 'none'}</span>} />
                {slicedArr?.length > 0 ? (
                    <>
                        <Badge
                            text={
                                <span className="gray-950" id={`tags-badge-${row?.equipment_id}`}>
                                    +{slicedArr.length} more
                                </span>
                            }
                        />
                        <UncontrolledTooltip
                            placement="top"
                            target={`tags-badge-${row?.equipment_id}`}
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

    const renderEquipmentName = useCallback((row) => {
        return (
            <div style={{ fontSize: 0 }}>
                <a
                    className="typography-wrapper link mouse-pointer"
                    onClick={() => {
                        setEquipmentFilter({
                            equipment_id: row?.equipment_id,
                            equipment_name: row?.equipment_name,
                            device_type: row?.device_type,
                        });
                        localStorage.setItem('exploreEquipName', row?.equipment_name);
                        handleChartOpen();
                    }}>
                    {row?.equipment_name !== '' ? row?.equipment_name : '-'}
                </a>
                <Brick sizeInPixels={3} />
            </div>
        );
    });

    const updateStoreOnPageLoad = () => {
        BreadcrumbStore.update((bs) => {
            let newList = [
                {
                    label: 'Building Overview',
                    path: '/explore/building',
                    active: true,
                },
            ];
            bs.items = newList;
        });
        ComponentStore.update((s) => {
            s.parent = 'explore';
        });
    };

    const handleDownloadCsv = async () => {
        setDownloadingCSVData(true);
        const ordered_by = sortBy.name === undefined ? 'consumption' : sortBy.name;
        const sort_by = sortBy.method === undefined ? 'dce' : sortBy.method;

        await fetchExploreEquipmentList(startDate, endDate, startTime, endTime, timeZone, bldgId, ordered_by, sort_by)
            .then((res) => {
                const { data } = res?.data;
                if (data.length !== 0) {
                    download(
                        `${bldgName}_Explore_By_Equipment_${new Date().toISOString().split('T')[0]}`,
                        getExploreByEquipmentTableCSVExport(data, headerProps)
                    );
                    UserStore.update((s) => {
                        s.showNotification = true;
                        s.notificationMessage = 'CSV export completed successfully.';
                        s.notificationType = 'success';
                    });
                }
            })
            .catch((error) => {
                UserStore.update((s) => {
                    s.showNotification = true;
                    s.notificationMessage = 'Data failed to export in CSV.';
                    s.notificationType = 'error';
                });
            })
            .finally(() => {
                setDownloadingCSVData(false);
            });
    };

    const fetchEquipDataList = async () => {
        setEquipDataFetching(true);
        const ordered_by = sortBy.name === undefined || sortBy.method === null ? 'consumption' : sortBy.name;
        const sort_by = sortBy.method === undefined || sortBy.method === null ? 'dce' : sortBy.method;

        setEquipDataList([]);

        await fetchExploreEquipmentList(
            startDate,
            endDate,
            startTime,
            endTime,
            timeZone,
            bldgId,
            ordered_by,
            sort_by,
            pageSize,
            pageNo,
            search,
            selectedEquipType,
            selectedEndUse,
            selectedSpaceType,
            selectedTags,
            selectedFloors,
            selectedSpaces,
            selectedPanels,
            selectedBreakers,
            selectedNotes,
            conAPIFlag,
            minConValue,
            maxConValue,
            perAPIFlag,
            minPerValue,
            maxPerValue
        )
            .then((res) => {
                const { data, total_data, total_building_usage } = res?.data;
                if (data) {
                    if (data.length !== 0) {
                        const updatedData = data.map((el) => ({
                            ...el,
                            totalBldgUsage: total_building_usage ? total_building_usage : 0,
                        }));
                        setEquipDataList(updatedData);

                        setSelectedEquipIds((prevState) => {
                            return prevState.filter((id) => updatedData.some((equip) => equip?.equipment_id === id));
                        });
                    }
                    if (data.length === 0) {
                        setSelectedEquipIds([]);
                        setSeriesData([]);
                        setComparisonMode(false);
                    }
                    if (total_data) setTotalItems(total_data);
                }
            })
            .catch((error) => {})
            .finally(() => {
                setEquipDataFetching(false);
            });
    };

    const fetchSingleEquipChartData = async (equipId, device_type, isComparisionOn = false) => {
        const payload = handleAPIRequestBody(startDate, endDate, timeZone, startTime, endTime);
        let previousDataPayload = {};

        if (isComparisionOn) {
            const pastDateObj = getPastDateRange(startDate, daysCount);
            previousDataPayload = handleAPIRequestBody(
                pastDateObj?.startDate,
                pastDateObj?.endDate,
                timeZone,
                startTime,
                endTime
            );
        }

        const params = `?building_id=${bldgId}&consumption=${
            selectedConsumption === 'rmsCurrentMilliAmps' && device_type === 'active' ? 'mAh' : selectedConsumption
        }&equipment_id=${equipId}&divisible_by=1000${
            selectedConsumption === 'rmsCurrentMilliAmps' ? '&detailed=true' : ''
        }`;

        let promisesList = [];
        promisesList.push(fetchExploreEquipmentChart(payload, params));
        if (isComparisionOn) promisesList.push(fetchExploreEquipmentChart(previousDataPayload, params));

        Promise.all(promisesList)
            .then((res) => {
                const response = res;

                response.forEach((record, index) => {
                    if (record?.status === 200 && record?.data?.success) {
                        const { data } = record?.data;

                        const equipObj = equipDataList.find((el) => el?.equipment_id === equipId);

                        if (!equipObj?.equipment_id || data.length === 0) return;

                        if (selectedConsumption === 'rmsCurrentMilliAmps') {
                            let chartData = [];

                            let legendName = equipObj?.equipment_name;
                            if (equipObj?.location.includes('>')) {
                                legendName += ` - ${equipObj?.location.split('>')[1].trim()}`;
                            }

                            data.forEach((sensorObj) => {
                                const newSensorMappedData = sensorObj?.data.map((el) => ({
                                    x: new Date(el?.time_stamp).getTime(),
                                    y: el?.consumption === '' ? null : el?.consumption,
                                }));

                                chartData.push({
                                    id: equipObj?.equipment_id,
                                    name: `${legendName} - Sensor ${sensorObj?.sensor_name}`,
                                    data: newSensorMappedData,
                                });
                            });

                            if (index === 0) setSeriesData([...seriesData, ...chartData]);
                            if (index === 1) setPastSeriesData([...pastSeriesData, ...chartData]);
                        }

                        if (selectedConsumption !== 'rmsCurrentMilliAmps') {
                            let legendName = equipObj?.equipment_name;
                            if (equipObj?.location.includes('>')) {
                                legendName += ` - ${equipObj?.location.split('>')[1].trim()}`;
                            }
                            const newEquipMappedData = data.map((el) => ({
                                x: new Date(el?.time_stamp).getTime(),
                                y: el?.consumption === '' ? null : el?.consumption,
                            }));

                            const recordToInsert = {
                                id: equipObj?.equipment_id,
                                name: legendName,
                                data: newEquipMappedData,
                            };

                            if (index === 0) setSeriesData([...seriesData, recordToInsert]);
                            if (index === 1) setPastSeriesData([...pastSeriesData, recordToInsert]);
                        }
                    } else {
                        UserStore.update((s) => {
                            s.showNotification = true;
                            s.notificationMessage = response?.message
                                ? response?.message
                                : res
                                ? 'Unable to fetch data for selected Equipment.'
                                : 'Unable to fetch data due to Internal Server Error!.';
                            s.notificationType = 'error';
                        });
                    }
                });
            })
            .catch((err) => {
                UserStore.update((s) => {
                    s.showNotification = true;
                    s.notificationMessage = 'Unable to fetch data due to Internal Server Error!.';
                    s.notificationType = 'error';
                });
            });
    };

    const fetchMultipleEquipChartData = async (
        start_date,
        end_date,
        data_type = 'energy',
        equipIDs = [],
        requestType = 'currentData'
    ) => {
        if (start_date === null || end_date === null || !data_type || equipIDs.length === 0) return;

        requestType === 'currentData' ? setFetchingChartData(true) : setFetchingPastChartData(true);

        const payload = handleAPIRequestBody(start_date, end_date, timeZone, startTime, endTime);

        const promisesList = [];

        equipIDs.forEach((id) => {
            const params = `?building_id=${bldgId}&consumption=${
                selectedConsumption === 'rmsCurrentMilliAmps' && deviceType === 'active' ? 'mAh' : selectedConsumption
            }&equipment_id=${id}&divisible_by=1000${
                selectedConsumption === 'rmsCurrentMilliAmps' ? '&detailed=true' : ''
            }`;
            promisesList.push(fetchExploreEquipmentChart(payload, params));
        });

        requestType === 'currentData' ? setSeriesData([]) : setPastSeriesData([]);

        Promise.all(promisesList)
            .then((res) => {
                const promiseResponse = res;

                if (promiseResponse?.length !== 0) {
                    const newResponse = [];

                    promiseResponse.forEach((record, index) => {
                        const response = record?.data;
                        if (response?.success && response?.data.length !== 0) {
                            const equipObj = equipDataList.find((el) => el?.equipment_id === equipIDs[index]);
                            if (!equipObj?.equipment_id) return;

                            if (selectedConsumption === 'rmsCurrentMilliAmps') {
                                let legendName = equipObj?.equipment_name;
                                if (equipObj?.location.includes('>')) {
                                    legendName += ` - ${equipObj?.location.split('>')[1].trim()}`;
                                }

                                response.data.forEach((sensorObj) => {
                                    const newSensorMappedData = sensorObj?.data.map((el) => ({
                                        x: new Date(el?.time_stamp).getTime(),
                                        y: el?.consumption === '' ? null : el?.consumption,
                                    }));

                                    newResponse.push({
                                        id: equipObj?.equipment_id,
                                        name: `${legendName} - ${sensorObj?.sensor_name}`,
                                        data: newSensorMappedData,
                                    });
                                });
                            }

                            if (selectedConsumption !== 'rmsCurrentMilliAmps') {
                                let legendName = equipObj?.equipment_name;
                                if (equipObj?.location.includes('>')) {
                                    legendName += ` - ${equipObj?.location.split('>')[1].trim()}`;
                                }

                                const newEquipMappedData = response?.data.map((el) => ({
                                    x: new Date(el?.time_stamp).getTime(),
                                    y: el?.consumption === '' ? null : el?.consumption,
                                }));

                                newResponse.push({
                                    id: equipObj?.equipment_id,
                                    name: legendName,
                                    data: newEquipMappedData,
                                });
                            }
                        }
                    });

                    requestType === 'currentData' ? setSeriesData(newResponse) : setPastSeriesData(newResponse);
                }
            })
            .catch(() => {})
            .finally(() => {
                requestType === 'currentData' ? setFetchingChartData(false) : setFetchingPastChartData(false);
            });
    };

    const fetchFiltersData = async () => {
        setFiltersFetching(true);
        setFilterObj({});
        setFilterOptions([]);

        await fetchExploreFilter(
            startDate,
            endDate,
            startTime,
            endTime,
            timeZone,
            bldgId,
            selectedEquipType,
            selectedEndUse,
            selectedSpaceType,
            selectedTags,
            selectedFloors,
            selectedSpaces,
            selectedPanels,
            selectedBreakers,
            selectedNotes,
            conAPIFlag,
            minConValue,
            maxConValue,
            perAPIFlag,
            minPerValue,
            maxPerValue
        )
            .then((res) => {
                const response = res?.data;
                if (response?.success) {
                    const { data } = response;
                    setTopVal(Math.round(data?.max_change === data?.min_change ? data?.max_change : data?.max_change));
                    setBottomVal(Math.round(data?.min_change));
                    setTopConsumption(Math.abs(Math.round(data?.max_consumption / 1000)));
                    setBottomConsumption(Math.abs(Math.round(data?.min_consumption / 1000)));
                    setTopPerChange(
                        Math.round(data?.max_change === data?.min_change ? data?.max_change : data?.max_change)
                    );
                    setNeutralPerChange(Math.round(data?.neutral_change));
                    setBottomPerChange(Math.round(data?.min_change));
                    set_minConValue(Math.abs(Math.round(data?.min_consumption / 1000)));
                    set_maxConValue(Math.abs(Math.round(data?.max_consumption / 1000)));
                    set_minPerValue(Math.round(data?.min_change));
                    set_maxPerValue(
                        Math.round(data?.max_change === data?.min_change ? data?.max_change : data?.max_change)
                    );
                    if (data) setFilterObj(data);
                } else {
                    setFilterObj({});
                    setFilterOptions([]);
                    set_minConValue(0);
                    set_maxConValue(0);
                    set_minPerValue(0);
                    set_maxPerValue(0);
                }
            })
            .catch((e) => {
                setFilterObj({});
                setFilterOptions([]);
                set_minConValue(0);
                set_maxConValue(0);
                set_minPerValue(0);
                set_maxPerValue(0);
            })
            .finally(() => {
                setFiltersFetching(false);
            });
    };

    const handleEquipStateChange = (value, equipObj, isComparisionOn = false) => {
        if (value === 'true') {
            const newDataList = seriesData.filter((item) => item?.id !== equipObj?.equipment_id);
            setSeriesData(newDataList);

            if (isComparisionOn) {
                const newPastDataList = pastSeriesData.filter((item) => item?.id !== equipObj?.equipment_id);
                setPastSeriesData(newPastDataList);
            }
        }

        if (value === 'false') {
            if (equipObj?.device_type) setDeviceType(equipObj?.device_type);
            if (equipObj?.equipment_id)
                fetchSingleEquipChartData(equipObj?.equipment_id, equipObj?.device_type, isComparisionOn);
        }

        const isAdding = value === 'false';
        setSelectedEquipIds((prevState) => {
            return isAdding
                ? [...prevState, equipObj?.equipment_id]
                : prevState.filter((equipId) => equipId !== equipObj?.equipment_id);
        });
    };

    const headerProps = [
        {
            name: 'Name',
            accessor: 'equipment_name',
            callbackValue: renderEquipmentName,
            onSort: (method, name) => setSortBy({ method, name }),
        },
        {
            name: 'Energy Consumption',
            accessor: 'consumption',
            callbackValue: renderConsumption,
            onSort: (method, name) => setSortBy({ method, name }),
        },
        {
            name: '% Change',
            accessor: 'change',
            callbackValue: renderPerChange,
            onSort: (method, name) => setSortBy({ method, name }),
        },
        {
            name: 'Location',
            accessor: 'location',
            onSort: (method, name) => setSortBy({ method, name }),
        },
        {
            name: 'Space Type',
            accessor: 'location_type',
            onSort: (method, name) => setSortBy({ method, name }),
        },
        {
            name: 'Equipment Type',
            accessor: 'equipments_type',
            onSort: (method, name) => setSortBy({ method, name }),
        },
        {
            name: 'End Use Category',
            accessor: 'end_user',
            onSort: (method, name) => setSortBy({ method, name }),
        },
        {
            name: 'Tags',
            accessor: 'tags',
            callbackValue: renderTags,
            onSort: (method, name) => setSortBy({ method, name }),
        },
        {
            name: 'Panel Name',
            accessor: 'panel',
            onSort: (method, name) => setSortBy({ method, name }),
        },
        {
            name: 'Breakers',
            accessor: 'breaker_number',
            callbackValue: renderBreakers,
            onSort: (method, name) => setSortBy({ method, name }),
        },
        {
            name: 'Notes',
            accessor: 'note',
            callbackValue: renderNotes,
            onSort: (method, name) => setSortBy({ method, name }),
        },
    ];

    useEffect(() => {
        window.scrollTo(0, 0);
        updateStoreOnPageLoad();
    }, []);

    useEffect(() => {
        if (pageNo !== 1 || pageSize !== 20) {
            window.scrollTo(0, 300);
        } else {
            window.scrollTo(0, 0);
        }
        setCheckedAll(false);
    }, [pageNo, pageSize]);

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
    }, [bldgId, buildingListData]);

    useEffect(() => {
        if (!bldgId || startDate === null || endDate === null) return;

        fetchEquipDataList();
    }, [
        startDate,
        endDate,
        startTime,
        endTime,
        bldgId,
        search,
        sortBy,
        pageSize,
        pageNo,
        selectedEquipType,
        selectedEndUse,
        selectedSpaceType,
        selectedTags,
        selectedFloors,
        selectedSpaces,
        selectedPanels,
        selectedBreakers,
        selectedNotes,
        conAPIFlag,
        perAPIFlag,
    ]);

    useEffect(() => {
        if (!bldgId || startDate === null || endDate === null) return;

        fetchFiltersData();
    }, [
        startDate,
        endDate,
        startTime,
        endTime,
        bldgId,
        selectedEquipType,
        selectedEndUse,
        selectedSpaceType,
        selectedTags,
        selectedFloors,
        selectedSpaces,
        selectedPanels,
        selectedBreakers,
        selectedNotes,
        conAPIFlag,
        perAPIFlag,
    ]);

    useEffect(() => {
        if (!isEmptyObject(filterObj)) {
            const filterOptionsFetched = [
                {
                    label: 'Energy Consumption',
                    value: 'consumption',
                    placeholder: 'All Consumptions',
                    filterType: FILTER_TYPES.RANGE_SELECTOR,
                    filterOptions: [minConValue, maxConValue],
                    componentProps: {
                        prefix: ' kWh',
                        title: 'Consumption',
                        min: bottomConsumption,
                        max: topConsumption + 1,
                        range: [minConValue, maxConValue],
                        withTrendsFilter: false,
                    },
                    onClose: async function onClose(options) {
                        set_minConValue(options[0]);
                        set_maxConValue(options[1]);
                        setPageNo(1);
                        setConAPIFlag(options[0] + options[1]);
                    },
                    onDelete: () => {
                        setPageNo(1);
                        set_minConValue(bottomConsumption);
                        set_maxConValue(topConsumption);
                        setConAPIFlag('');
                    },
                },
                {
                    label: '% Change',
                    value: 'change',
                    placeholder: 'All % Change',
                    filterType: FILTER_TYPES.RANGE_SELECTOR,
                    filterOptions: [minPerValue, maxPerValue],
                    componentProps: {
                        prefix: ' %',
                        title: '% Change',
                        min: bottomVal,
                        max: topVal + 1,
                        range: [minPerValue, maxPerValue],
                        withTrendsFilter: true,
                        currentButtonId: currentButtonId,
                        handleButtonClick: function handleButtonClick() {
                            for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
                                args[_key] = arguments[_key];
                                if (args[0] === 0) {
                                    setIsOpened(true);
                                    setCurrentButtonId(0);
                                    set_minPerValue(bottomPerChange);
                                    set_maxPerValue(topPerChange);
                                    setBottomVal(bottomPerChange);
                                    setTopVal(topPerChange);
                                }
                                if (args[0] === 1) {
                                    setIsOpened(true);
                                    setCurrentButtonId(1);
                                    if (bottomPerChange < 0) {
                                        setBottomVal(bottomPerChange);
                                        setTopVal(neutralPerChange);
                                        set_minPerValue(bottomPerChange);
                                        set_maxPerValue(neutralPerChange);
                                    } else if (bottomPerChange >= 0) {
                                        setBottomVal(neutralPerChange);
                                        setTopVal(neutralPerChange + 1);
                                        set_minPerValue(neutralPerChange);
                                        set_maxPerValue(neutralPerChange);
                                    }
                                }
                                if (args[0] === 2) {
                                    setIsOpened(true);
                                    setCurrentButtonId(2);
                                    if (topPerChange > 0) {
                                        setBottomVal(neutralPerChange);
                                        setTopVal(topPerChange);
                                        set_minPerValue(neutralPerChange);
                                        set_maxPerValue(topPerChange);
                                    } else if (bottomPerChange >= 0) {
                                        setBottomVal(neutralPerChange);
                                        setTopVal(neutralPerChange + 1);
                                        set_minPerValue(neutralPerChange);
                                        set_maxPerValue(neutralPerChange);
                                    }
                                }
                            }
                        },
                    },
                    isOpened: isopened,
                    onClose: function onClose(options) {
                        setIsOpened(false);
                        set_minPerValue(options[0]);
                        set_maxPerValue(options[1]);
                        setPageNo(1);
                        setPerAPIFlag(options[0] + options[1]);
                    },
                    onDelete: () => {
                        setPageNo(1);
                        set_minPerValue(bottomPerChange);
                        set_maxPerValue(topPerChange);
                        setPerAPIFlag('');
                    },
                },
                {
                    label: 'Equipment Type',
                    value: 'equipments_type',
                    placeholder: 'All Equipment Types',
                    filterType: FILTER_TYPES.MULTISELECT,
                    filterOptions: _.chain(filterObj?.equipments_type)
                        .sortBy('equipment_type_name')
                        .map((filterItem) => ({
                            value: filterItem.equipment_type_id,
                            label: filterItem.equipment_type_name,
                        }))
                        .value(),
                    onChange: function onChange(options) {},
                    onClose: (options) => {
                        let opt = options;
                        if (opt.length !== 0) {
                            let equipIds = [];
                            for (let i = 0; i < opt.length; i++) {
                                equipIds.push(opt[i].value);
                            }
                            setPageNo(1);
                            setSelectedEquipType(equipIds);
                        }
                    },
                    onDelete: (options) => {
                        setPageNo(1);
                        setSelectedEquipType([]);
                    },
                },
                {
                    label: 'End Use',
                    value: 'end_users',
                    placeholder: 'All End Uses',
                    filterType: FILTER_TYPES.MULTISELECT,
                    filterOptions: _.chain(filterObj?.end_users)
                        .sortBy('end_use_name')
                        .map((filterItem) => ({
                            value: filterItem?.end_use_id,
                            label: filterItem?.end_use_name,
                        }))
                        .value(),
                    onClose: (options) => {
                        let opt = options;
                        if (opt.length !== 0) {
                            let endUseIds = [];
                            for (let i = 0; i < opt.length; i++) {
                                endUseIds.push(opt[i].value);
                            }
                            setPageNo(1);
                            setSelectedEndUse(endUseIds);
                        }
                    },
                    onDelete: () => {
                        setPageNo(1);
                        setSelectedEndUse([]);
                    },
                },

                {
                    label: 'Floor',
                    value: 'floor',
                    placeholder: 'All Floors',
                    filterType: FILTER_TYPES.MULTISELECT,
                    filterOptions: _.chain(filterObj?.floors)
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
                            setSelectedFloors(sensors);
                        }
                    },
                    onDelete: () => {
                        setPageNo(1);
                        setSelectedFloors([]);
                    },
                },
                {
                    label: 'Space',
                    value: 'space',
                    placeholder: 'All Spaces',
                    filterType: FILTER_TYPES.MULTISELECT,
                    filterOptions: _.chain(filterObj?.spaces)
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
                            setSelectedSpaces(sensors);
                        }
                    },
                    onDelete: () => {
                        setPageNo(1);
                        setSelectedSpaces([]);
                    },
                },
                {
                    label: 'Space Type',
                    value: 'location_types',
                    placeholder: 'All Space Types',
                    filterType: FILTER_TYPES.MULTISELECT,
                    filterOptions: _.chain(filterObj?.location_types)
                        .sortBy('location_types_name')
                        .map((filterItem) => ({
                            value: filterItem?.location_type_id,
                            label: filterItem?.location_types_name,
                        }))
                        .value(),
                    onClose: (options) => {
                        let opt = options;
                        if (opt.length !== 0) {
                            let spaceIds = [];
                            for (let i = 0; i < opt.length; i++) {
                                spaceIds.push(opt[i].value);
                            }
                            setPageNo(1);
                            setSelectedSpaceType(spaceIds);
                        }
                    },
                    onDelete: () => {
                        setPageNo(1);
                        setSelectedSpaceType([]);
                    },
                },
                {
                    label: 'Tags',
                    value: 'tags',
                    placeholder: 'All tags',
                    filterType: FILTER_TYPES.MULTISELECT,
                    filterOptions: _.chain(filterObj?.tags)
                        .map((filterItem) => ({
                            value: filterItem,
                            label: filterItem,
                        }))
                        .sortBy('label')
                        .value(),
                    onClose: (options) => {
                        let opt = options;
                        if (opt.length !== 0) {
                            let tags = [];
                            for (let i = 0; i < opt.length; i++) {
                                tags.push(opt[i].value);
                            }
                            setSelectedTags(tags);
                        }
                    },
                    onDelete: () => {
                        setPageNo(1);
                        setSelectedTags([]);
                    },
                },
                {
                    label: 'Panel Name',
                    value: 'panel',
                    placeholder: 'All Panels',
                    filterType: FILTER_TYPES.MULTISELECT,
                    filterOptions: _.chain(filterObj?.panel)
                        .sortBy('panel_name')
                        .map((filterItem) => ({
                            value: filterItem?.panel_id,
                            label: filterItem?.panel_name,
                        }))
                        .value(),
                    onClose: (options) => {
                        let opt = options;
                        if (opt.length !== 0) {
                            let panels = [];
                            for (let i = 0; i < opt.length; i++) {
                                panels.push(opt[i].value);
                            }
                            setSelectedPanels(panels);
                        }
                    },
                    onDelete: () => {
                        setPageNo(1);
                        setSelectedPanels([]);
                    },
                },
                {
                    label: 'Breakers',
                    value: 'breaker_number',
                    placeholder: 'All Breakers',
                    filterType: FILTER_TYPES.MULTISELECT,
                    filterOptions: _.chain(filterObj?.breaker_number)
                        .map((filterItem) => ({
                            value: filterItem,
                            label: filterItem,
                        }))
                        .sortBy('label')
                        .value(),
                    onClose: (options) => {
                        let opt = options;
                        if (opt.length !== 0) {
                            let breakers_count = [];
                            for (let i = 0; i < opt.length; i++) {
                                breakers_count.push(opt[i].value);
                            }
                            setSelectedBreakers(breakers_count);
                        }
                    },
                    onDelete: () => {
                        setPageNo(1);
                        setSelectedBreakers([]);
                    },
                },
                {
                    label: 'Notes',
                    value: 'notes',
                    placeholder: 'All Notes',
                    filterType: FILTER_TYPES.MULTISELECT,
                    filterOptions: filterObj?.notes.map((filterItem) => ({
                        value: filterItem?.value,
                        label: filterItem?.label,
                    })),
                    onClose: (options) => {
                        let opt = options;
                        if (opt.length !== 0) {
                            let notes = [];
                            for (let i = 0; i < opt.length; i++) {
                                notes.push(opt[i].value);
                            }
                            setSelectedNotes(notes);
                        }
                    },
                    onDelete: () => {
                        setPageNo(1);
                        setSelectedNotes([]);
                    },
                },
            ];
            setFilterOptions(filterOptionsFetched);
        }
    }, [filterObj]);

    useEffect(() => {
        if (selectedEquipIds.length !== 0) {
            fetchMultipleEquipChartData(startDate, endDate, selectedConsumption, selectedEquipIds, 'currentData');

            if (isInComparisonMode) {
                const pastDateObj = getPastDateRange(startDate, daysCount);
                fetchMultipleEquipChartData(
                    pastDateObj?.startDate,
                    pastDateObj?.endDate,
                    selectedConsumption,
                    selectedEquipIds,
                    'pastData'
                );
            }
        }
    }, [startDate, endDate, startTime, endTime, selectedConsumption]);

    useEffect(() => {
        if (checkedAll) {
            if (equipDataList.length !== 0 && equipDataList.length <= 20) {
                const allEquipIds = equipDataList.map((el) => el?.equipment_id);
                fetchMultipleEquipChartData(startDate, endDate, selectedConsumption, allEquipIds, 'currentData');
                setSelectedEquipIds(allEquipIds);

                if (isInComparisonMode) {
                    const pastDateObj = getPastDateRange(startDate, daysCount);
                    fetchMultipleEquipChartData(
                        pastDateObj?.startDate,
                        pastDateObj?.endDate,
                        selectedConsumption,
                        selectedEquipIds,
                        'pastData'
                    );
                }
            }
        }
        if (!checkedAll) {
            setSeriesData([]);
            setPastSeriesData([]);
            setComparisonMode(false);
            setSelectedEquipIds([]);
        }
    }, [checkedAll]);

    useEffect(() => {
        if (isInComparisonMode) {
            const pastDateObj = getPastDateRange(startDate, daysCount);
            fetchMultipleEquipChartData(
                pastDateObj?.startDate,
                pastDateObj?.endDate,
                selectedConsumption,
                selectedEquipIds,
                'pastData'
            );
        } else {
            setPastSeriesData([]);
        }
    }, [isInComparisonMode]);

    useEffect(() => {
        updateBreadcrumbStore([
            {
                label: 'By Building',
                path: `/explore/overview/by-buildings`,
                active: false,
            },
            {
                label: bldgName ?? 'Building',
                path: `/explore/building/${bldgId}/${EXPLORE_FILTER_TYPE.NO_GROUPING}`,
                active: true,
            },
        ]);
    }, [bldgId, bldgName]);

    const dataToRenderOnChart = validateSeriesDataForEquipments(selectedEquipIds, equipDataList, seriesData);
    const pastDataToRenderOnChart = validateSeriesDataForEquipments(selectedEquipIds, equipDataList, pastSeriesData);

    return (
        <React.Fragment>
            <Row className="m-0">
                <div className="explore-data-table-style">
                    {isFetchingChartData || isFetchingPastChartData ? (
                        <div className="explore-chart-wrapper">
                            <div className="explore-chart-loader">
                                <Spinner color="primary" />
                            </div>
                        </div>
                    ) : (
                        <>
                            {isInComparisonMode ? (
                                <ExploreCompareChart
                                    title={''}
                                    subTitle={''}
                                    data={dataToRenderOnChart}
                                    pastData={pastDataToRenderOnChart}
                                    tooltipUnit={selectedUnit}
                                    tooltipLabel={selectedConsumptionLabel}
                                    timeIntervalObj={{
                                        startDate,
                                        endDate,
                                        daysCount,
                                    }}
                                    chartProps={{
                                        tooltip: {
                                            xDateFormat: dateTimeFormatForHighChart(
                                                userPrefDateFormat,
                                                userPrefTimeFormat
                                            ),
                                        },
                                    }}
                                    chartType={selectedConsumption}
                                />
                            ) : (
                                <ExploreChart
                                    title={''}
                                    subTitle={''}
                                    isLoadingData={false}
                                    disableDefaultPlotBands={true}
                                    tooltipValuesKey={'{point.y:.1f}'}
                                    tooltipUnit={selectedUnit}
                                    tooltipLabel={selectedConsumptionLabel}
                                    data={dataToRenderOnChart}
                                    chartProps={{
                                        navigator: {
                                            outlineWidth: 0,
                                            adaptToUpdatedData: false,
                                            stickToMax: true,
                                        },
                                        plotOptions: {
                                            series: {
                                                states: {
                                                    inactive: {
                                                        opacity: 1,
                                                    },
                                                },
                                            },
                                        },
                                        xAxis: {
                                            gridLineWidth: 0,
                                            type: 'datetime',
                                            labels: {
                                                format: formatXaxisForHighCharts(
                                                    daysCount,
                                                    userPrefDateFormat,
                                                    userPrefTimeFormat,
                                                    selectedConsumption
                                                ),
                                            },
                                        },
                                        yAxis: [
                                            {
                                                gridLineWidth: 1,
                                                lineWidth: 1,
                                                opposite: false,
                                                lineColor: null,
                                            },
                                            {
                                                opposite: true,
                                                title: false,
                                                max: 120,
                                                postFix: '23',
                                                gridLineWidth: 0,
                                            },
                                        ],
                                        tooltip: {
                                            xDateFormat: dateTimeFormatForHighChart(
                                                userPrefDateFormat,
                                                userPrefTimeFormat
                                            ),
                                        },
                                    }}
                                />
                            )}
                        </>
                    )}
                </div>
            </Row>

            <Brick sizeInRem={1} />

            <Row className="m-0">
                <div className="w-100">
                    <DataTableWidget
                        id="explore-by-equipment"
                        isLoading={isEquipDataFetching}
                        isLoadingComponent={<SkeletonLoader noOfColumns={headerProps.length + 1} noOfRows={20} />}
                        isFilterLoading={isFiltersFetching}
                        onSearch={(e) => {
                            setSearch(e);
                            setCheckedAll(false);
                        }}
                        buttonGroupFilterOptions={[]}
                        rows={currentRow()}
                        searchResultRows={currentRow()}
                        filterOptions={filterOptions}
                        onDownload={() => handleDownloadCsv()}
                        isCSVDownloading={isCSVDownloading}
                        headers={headerProps}
                        customExcludedHeaders={['Panel Name', 'Breakers', 'Notes']}
                        customCheckAll={() => (
                            <Checkbox
                                label=""
                                type="checkbox"
                                id="equipment1"
                                name="equipment1"
                                checked={checkedAll}
                                onChange={() => {
                                    setCheckedAll(!checkedAll);
                                }}
                                disabled={!equipDataList || equipDataList.length > 20 || isInComparisonMode}
                            />
                        )}
                        customCheckboxForCell={(record) => (
                            <Checkbox
                                label=""
                                type="checkbox"
                                id="equip"
                                name="equip"
                                checked={selectedEquipIds.includes(record?.equipment_id)}
                                value={selectedEquipIds.includes(record?.equipment_id)}
                                onChange={(e) => {
                                    handleEquipStateChange(e.target.value, record, isInComparisonMode);
                                }}
                            />
                        )}
                        pageSize={pageSize}
                        currentPage={pageNo}
                        onPageSize={setPageSize}
                        onChangePage={setPageNo}
                        pageListSizes={pageListSizes}
                        totalCount={(() => {
                            return totalItems;
                        })()}
                    />
                </div>
            </Row>

            <EquipChartModal
                showEquipmentChart={showEquipmentChart}
                handleChartClose={handleChartClose}
                selectedEquipObj={equipmentFilter}
                fetchEquipmentData={fetchEquipDataList}
                selectedTab={selectedModalTab}
                setSelectedTab={setSelectedModalTab}
                activePage="explore"
            />
        </React.Fragment>
    );
};

export default ExploreByEquipments;
