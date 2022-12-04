import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Row, Col } from 'reactstrap';
import { fetchExploreEquipmentList, fetchExploreEquipmentChart, fetchExploreFilter } from '../explore/services';
import { BreadcrumbStore } from '../../store/BreadcrumbStore';
import { DateRangeStore } from '../../store/DateRangeStore';
import { BuildingStore } from '../../store/BuildingStore';
import { Cookies } from 'react-cookie';
import { ComponentStore } from '../../store/ComponentStore';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { useParams } from 'react-router-dom';
import EquipChartModal from '../chartModal/EquipChartModal';
import './style.css';
import 'moment-timezone';
import moment from 'moment';
import Header from '../../components/Header';
import { selectedEquipment, totalSelectionEquipmentId } from '../../store/globalState';
import { useAtom } from 'jotai';
import { apiRequestBody } from '../../helpers/helpers';
import { DataTableWidget } from '../../sharedComponents/dataTableWidget';
import { Checkbox } from '../../sharedComponents/form/checkbox';
import Brick from '../../sharedComponents/brick';
import { TinyBarChart } from '../../sharedComponents/tinyBarChart';
import { TrendsBadge } from '../../sharedComponents/trendsBadge';
import Typography from '../../sharedComponents/typography';
import { FILTER_TYPES } from '../../sharedComponents/dataTableWidget/constants';
import ExploreChart from '../../sharedComponents/exploreChart/ExploreChart';
import { fetchDateRange } from '../../helpers/formattedChartData';

const SkeletonLoading = () => (
    <SkeletonTheme color="$primary-gray-1000" height={35}>
        <tr>
            <th>
                <Skeleton count={5} />
            </th>

            <th>
                <Skeleton count={5} />
            </th>

            <th>
                <Skeleton count={5} />
            </th>

            <th>
                <Skeleton count={5} />
            </th>

            <th>
                <Skeleton count={5} />
            </th>

            <th>
                <Skeleton count={5} />
            </th>
            <th>
                <Skeleton count={5} />
            </th>
            <th>
                <Skeleton count={5} />
            </th>
        </tr>
    </SkeletonTheme>
);

const ExploreByEquipment = () => {
    const { bldgId } = useParams();

    const [chartLoading, setChartLoading] = useState(false);

    const [equpimentIdSelection] = useAtom(selectedEquipment);
    const [totalEquipmentId] = useAtom(totalSelectionEquipmentId);

    let cookies = new Cookies();
    let userdata = cookies.get('user');

    // New Refactor Declarations
    const isLoadingRef = useRef(false);
    const [conAPIFlag, setConAPIFlag] = useState('');
    const [perAPIFlag, setPerAPIFlag] = useState('');
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState({});
    const [allSearchData, setAllSearchData] = useState([]);
    const [totalItems, setTotalItems] = useState(0);
    const [totalItemsSearched, setTotalItemsSearched] = useState(0);
    const [allEquipmentList, setAllEquipmentList] = useState([]);
    const [selectedEquipmentFilter, setSelectedEquipmentFilter] = useState(0);
    const [selectedIds, setSelectedIds] = useState([]);
    const [filterOptions, setFilterOptions] = useState([]);
    const [checkedAll, setCheckedAll] = useState(false);
    const [equipIdNow, setEquipIdNow] = useState('');

    const startDate = DateRangeStore.useState((s) => new Date(s.startDate));
    const endDate = DateRangeStore.useState((s) => new Date(s.endDate));
    const daysCount = DateRangeStore.useState((s) => +s.daysCount);
    const timeZone = BuildingStore.useState((s) => s.BldgTimeZone);

    const [isExploreChartDataLoading, setIsExploreChartDataLoading] = useState(false);
    const [isExploreDataLoading, setIsExploreDataLoading] = useState(false);
    const [seriesData, setSeriesData] = useState([]);
    let entryPoint = '';

    const [pageSize, setPageSize] = useState(20);
    const [pageNo, setPageNo] = useState(1);
    const [seriesLineData, setSeriesLineData] = useState([]);
    const [filterData, setFilterData] = useState({});
    const [topConsumption, setTopConsumption] = useState(0);
    const [bottomConsumption, setBottomConsumption] = useState(0);
    const [topPerChange, setTopPerChange] = useState(0);
    const [neutralPerChange, setNeutralPerChange] = useState(0);
    const [bottomPerChange, setBottomPerChange] = useState(0);
    const [showEquipmentChart, setShowEquipmentChart] = useState(false);
    const handleChartOpen = () => setShowEquipmentChart(true);
    const handleChartClose = () => setShowEquipmentChart(false);
    const [selectedEquipmentId, setSelectedEquipmentId] = useState('');
    const [removeEquipmentId, setRemovedEquipmentId] = useState('');
    const [equipmentListArray, setEquipmentListArray] = useState([]);
    const [allEquipmentData, setAllEquipmenData] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState([]);
    const [selectedEquipType, setSelectedEquipType] = useState([]);
    const [selectedEndUse, setSelectedEndUse] = useState([]);
    const [selectedSpaceType, setSelectedSpaceType] = useState([]);
    const [minConValue, set_minConValue] = useState(0);
    const [maxConValue, set_maxConValue] = useState(0);
    const [minPerValue, set_minPerValue] = useState(0);
    const [maxPerValue, set_maxPerValue] = useState(0);
    const [currentButtonId, setCurrentButtonId] = useState(0);
    const [isopened, setIsOpened] = useState(false);

    const [exploreTableData, setExploreTableData] = useState([]);

    const [topEnergyConsumption, setTopEnergyConsumption] = useState(1);
    const [equipmentFilter, setEquipmentFilter] = useState({});
    const [selectedModalTab, setSelectedModalTab] = useState(0);
    const [selectedAllEquipmentId, setSelectedAllEquipmentId] = useState([]);

    useEffect(() => {
        entryPoint = 'entered';
    }, []);
    useEffect(() => {
        if (entryPoint !== 'entered') {
            setConAPIFlag('');
            setPerAPIFlag('');
            setSelectedIds([]);
            setSelectedEndUse([]);
            setSelectedEquipType([]);
            setSelectedSpaceType([]);
            setConAPIFlag('');
            setPerAPIFlag('');
        }
    }, [bldgId]);

    useEffect(() => {
        if (selectedIds?.length >= 1) {
            let arr = [];
            for (let i = 0; i < selectedIds?.length; i++) {
                arr.push(selectedIds[i]);
            }
            setSelectedAllEquipmentId(arr);
        } else {
            setSelectedEquipmentId('');
        }
    }, [startDate, endDate]);

    useEffect(() => {
        setAllSearchData([]);
        if (equipIdNow) {
            fetchExploreChartData(equipIdNow);
        }
    }, [equipIdNow]);

    const exploreDataFetch = async (bodyVal) => {
        const ordered_by = sortBy.name === undefined ? 'consumption' : sortBy.name;
        const sort_by = sortBy.method === undefined ? 'dce' : sortBy.method;
        setIsExploreDataLoading(true);

        await fetchExploreEquipmentList(
            startDate,
            endDate,
            timeZone,
            bldgId,
            search,
            ordered_by,
            sort_by,
            pageSize,
            pageNo,
            minConValue,
            maxConValue,
            minPerValue,
            maxPerValue,
            selectedLocation,
            selectedEndUse,
            selectedEquipType,
            selectedSpaceType,
            conAPIFlag,
            perAPIFlag
        )
            .then((res) => {
                let responseData = res.data;
                if (responseData.data.length !== 0) {
                    if (entryPoint === 'entered') {
                        totalEquipmentId.length = 0;
                        setSeriesData([]);
                        setSeriesLineData([]);
                    }
                    setTopEnergyConsumption(responseData.data[0].consumption.now);
                }
                setExploreTableData(responseData.data);
                setAllEquipmentList(responseData.data);
                setTotalItems(responseData.total_data);
                setTotalItemsSearched(responseData.data.length);
                setAllSearchData(responseData.data);
                setIsExploreDataLoading(false);
            })
            .catch((error) => {
                setIsExploreDataLoading(false);
            });
    };

    let arr = apiRequestBody(startDate, endDate, timeZone);

    const currentRow = () => {
        if (selectedEquipmentFilter === 0) {
            return allEquipmentList;
        }
        if (selectedEquipmentFilter === 1) {
            return selectedIds.reduce((acc, id) => {
                const foundSelectedEquipment = allEquipmentList.find((eqId) => eqId.equipment_id === id);
                if (foundSelectedEquipment) {
                    acc.push(foundSelectedEquipment);
                }
                return acc;
            }, []);
        }
        return allEquipmentList.filter(({ equipment_id }) => !selectedIds.find((eqID) => eqID === equipment_id));
    };

    const currentRowSearched = () => {
        if (selectedEquipmentFilter === 0) {
            return allSearchData;
        }
        if (selectedEquipmentFilter === 1) {
            return selectedIds.reduce((acc, id) => {
                const foundSelectedEquipment = allSearchData.find((eqId) => eqId.equipment_id === id);
                if (foundSelectedEquipment) {
                    acc.push(foundSelectedEquipment);
                }
                return acc;
            }, []);
        }
        return allSearchData.filter(({ id }) => !selectedIds.find((eqId) => eqId === id));
    };

    const renderConsumption = (row) => {
        return (
            <>
                <Typography.Body size={Typography.Sizes.sm}>
                    {Math.round(row.consumption.now / 1000)} kWh
                </Typography.Body>
                <Brick sizeInRem={0.375} />
                <TinyBarChart percent={Math.round((row.consumption.now / topEnergyConsumption) * 100)} />
            </>
        );
    };

    const renderPerChange = (row) => {
        return (
            <TrendsBadge
                value={Math.abs(Math.round(row.consumption.change))}
                type={
                    row.consumption.change === 0
                        ? TrendsBadge.Type.NEUTRAL_TREND
                        : row.consumption.now < row.consumption.old
                        ? TrendsBadge.Type.DOWNWARD_TREND
                        : TrendsBadge.Type.UPWARD_TREND
                }
            />
        );
    };

    const renderEquipmentName = (row) => {
        return (
            <div style={{ fontSize: 0 }}>
                <a
                    className="typography-wrapper link"
                    onClick={() => {
                        setEquipmentFilter({
                            equipment_id: row?.equipment_id,
                            equipment_name: row?.equipment_name,
                        });
                        localStorage.setItem('exploreEquipName', row?.equipment_name);
                        handleChartOpen();
                    }}>
                    {row.equipment_name}
                </a>
                <Brick sizeInPixels={3} />
            </div>
        );
    };
    const handleEquipStateChange = (value, equip) => {
        if (value === 'true') {
            let arr1 = seriesData.filter(function (item) {
                return item.id !== equip?.equipment_id;
            });
            setSeriesData(arr1);
            setSeriesLineData(arr1);
        }

        if (value === 'false') {
            setEquipIdNow(equip?.equipment_id);
        }

        const isAdding = value === 'false';

        setSelectedIds((prevState) => {
            return isAdding
                ? [...prevState, equip.equipment_id]
                : prevState.filter((equipId) => equipId !== equip.equipment_id);
        });
    };
    const fetchAPI = useCallback(() => {
        exploreDataFetch();
    }, [
        startDate,
        endDate,
        bldgId,
        search,
        sortBy,
        pageSize,
        pageNo,
        selectedEquipType,
        selectedEndUse,
        selectedSpaceType,
        conAPIFlag,
        perAPIFlag,
    ]);

    useEffect(() => {
        if (startDate === null) {
            return;
        }
        if (endDate === null) {
            return;
        }

        fetchAPI();
    }, [
        startDate,
        endDate,
        bldgId,
        search,
        sortBy,
        pageSize,
        pageNo,
        selectedEquipType,
        selectedEndUse,
        selectedSpaceType,
        conAPIFlag,
        perAPIFlag,
    ]);

    useEffect(() => {}, [selectedEquipType, selectedEndUse, selectedSpaceType]);
    useEffect(() => {
        (async () => {
            setIsExploreDataLoading(true);
            const filters = await fetchExploreFilter(bldgId, startDate, endDate, timeZone, [], [], [], [], 0, 0, '');
            if (filters?.data?.data !== null) {
                setFilterData(filters.data.data);

                setTopConsumption(Math.abs(Math.round(filters?.data?.data?.max_consumption / 1000)));
                setBottomConsumption(Math.abs(Math.round(filters?.data?.data?.min_consumption / 1000)));
                setTopPerChange(
                    Math.round(
                        filters.data.data.max_change === filters.data.data.min_change
                            ? filters.data.data.max_change + 1
                            : filters.data.data.max_change
                    )
                );
                setNeutralPerChange(Math.round(filters.data.data.neutral_change));
                setBottomPerChange(Math.round(filters.data.data.min_change));
                set_minConValue(Math.abs(Math.round(filters.data.data.min_consumption / 1000)));
                set_maxConValue(Math.abs(Math.round(filters.data.data.max_consumption / 1000)));
                set_minPerValue(Math.round(filters.data.data.min_change));
                set_maxPerValue(
                    Math.round(
                        filters.data.data.max_change === filters.data.data.min_change
                            ? filters.data.data.max_change + 1
                            : filters.data.data.max_change
                    )
                );
            }

            setIsExploreDataLoading(false);
        })();
    }, [startDate, endDate, bldgId]);

    useEffect(() => {
        if (conAPIFlag !== '' || selectedEndUse.length !== 0) {
            (async () => {
                const filters = await fetchExploreFilter(
                    bldgId,
                    startDate,
                    endDate,
                    timeZone,
                    selectedLocation,
                    selectedEquipType,
                    selectedEndUse,
                    selectedSpaceType,
                    minConValue,
                    maxConValue,
                    conAPIFlag
                );

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
                            min: bottomPerChange,
                            max: topPerChange + 1,
                            range: [minPerValue, maxPerValue],
                            withTrendsFilter: true,
                            currentButtonId: currentButtonId,
                            handleButtonClick: function handleButtonClick() {
                                for (
                                    var _len = arguments.length, args = new Array(_len), _key = 0;
                                    _key < _len;
                                    _key++
                                ) {
                                    args[_key] = arguments[_key];
                                    if (args[0] === 0) {
                                        setIsOpened(true);
                                        setCurrentButtonId(0);
                                        set_minPerValue(bottomPerChange);
                                        set_maxPerValue(topPerChange);
                                    }
                                    if (args[0] === 1) {
                                        setIsOpened(true);
                                        setCurrentButtonId(1);
                                        set_minPerValue(bottomPerChange);
                                        set_maxPerValue(neutralPerChange);
                                    }
                                    if (args[0] === 2) {
                                        setIsOpened(true);
                                        setCurrentButtonId(2);
                                        set_minPerValue(neutralPerChange);
                                        set_maxPerValue(topPerChange);
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
                            set_minPerValue(bottomPerChange);
                            set_maxPerValue(topPerChange);
                            setPerAPIFlag('');
                        },
                    },
                    {
                        label: 'Location',
                        value: 'spaces',
                        placeholder: 'All Locations',
                        filterType: FILTER_TYPES.MULTISELECT,
                        filterOptions: filters.data.data.spaces.map((filterItem) => ({
                            value: filterItem.space_id,
                            label: filterItem.space_name,
                        })),
                        onClose: (options) => {},
                        onDelete: () => {
                            setSelectedLocation([]);
                            //setMacTypeFilterString('');
                        },
                    },
                    {
                        label: 'Equipment Type',
                        value: 'equipments_type',
                        placeholder: 'All Equipment Types',
                        filterType: FILTER_TYPES.MULTISELECT,
                        filterOptions: filters.data.data.equipments_type.map((filterItem) => ({
                            value: filterItem.equipment_type_id,
                            label: filterItem.equipment_type_name,
                        })),
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
                            setSelectedEquipType([]);
                        },
                    },
                    {
                        label: 'End Uses',
                        value: 'end_users',
                        placeholder: 'All End Uses',
                        filterType: FILTER_TYPES.MULTISELECT,
                        filterOptions: filterData.end_users.map((filterItem) => ({
                            value: filterItem.end_use_id,
                            label: filterItem.end_use_name,
                        })),
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
                            setSelectedEndUse([]);
                        },
                    },
                    {
                        label: 'Space Type',
                        value: 'location_types',
                        placeholder: 'All Space Types',
                        filterType: FILTER_TYPES.MULTISELECT,
                        filterOptions: filters.data.data.location_types.map((filterItem) => ({
                            value: filterItem.location_type_id,
                            label: filterItem.location_types_name,
                        })),
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
                            setSelectedSpaceType([]);
                        },
                    },
                ];
                setFilterOptions(filterOptionsFetched);
            })();
        }
    }, [conAPIFlag, selectedEndUse]);

    useEffect(() => {
        if (perAPIFlag !== '') {
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
                        min: bottomPerChange,
                        max: topPerChange + 1,
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
                                }
                                if (args[0] === 1) {
                                    setIsOpened(true);
                                    setCurrentButtonId(1);
                                    set_minPerValue(bottomPerChange);
                                    set_maxPerValue(neutralPerChange);
                                }
                                if (args[0] === 2) {
                                    setIsOpened(true);
                                    setCurrentButtonId(2);
                                    set_minPerValue(neutralPerChange);
                                    set_maxPerValue(topPerChange);
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
                        set_minPerValue(bottomPerChange);
                        set_maxPerValue(topPerChange);
                        setPerAPIFlag('');
                    },
                },
                {
                    label: 'Location',
                    value: 'spaces',
                    placeholder: 'All Locations',
                    filterType: FILTER_TYPES.MULTISELECT,
                    filterOptions: filterData.spaces.map((filterItem) => ({
                        value: filterItem.space_id,
                        label: filterItem.space_name,
                    })),
                    onClose: (options) => {},
                    onDelete: () => {
                        setSelectedLocation([]);
                        //setMacTypeFilterString('');
                    },
                },
                {
                    label: 'Equipment Type',
                    value: 'equipments_type',
                    placeholder: 'All Equipment Types',
                    filterType: FILTER_TYPES.MULTISELECT,
                    filterOptions: filterData.equipments_type.map((filterItem) => ({
                        value: filterItem.equipment_type_id,
                        label: filterItem.equipment_type_name,
                    })),
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
                        setSelectedEquipType([]);
                    },
                },
                {
                    label: 'End Uses',
                    value: 'end_users',
                    placeholder: 'All End Uses',
                    filterType: FILTER_TYPES.MULTISELECT,
                    filterOptions: filterData.end_users.map((filterItem) => ({
                        value: filterItem.end_use_id,
                        label: filterItem.end_use_name,
                    })),
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
                        setSelectedEndUse([]);
                    },
                },
                {
                    label: 'Space Type',
                    value: 'location_types',
                    placeholder: 'All Space Types',
                    filterType: FILTER_TYPES.MULTISELECT,
                    filterOptions: filterData.location_types.map((filterItem) => ({
                        value: filterItem.location_type_id,
                        label: filterItem.location_types_name,
                    })),
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
                        setSelectedSpaceType([]);
                    },
                },
            ];
            setFilterOptions(filterOptionsFetched);
        }
    }, [perAPIFlag]);
    useEffect(() => {
        if ((minConValue !== maxConValue && maxConValue !== 0) || (minPerValue !== maxPerValue && maxPerValue !== 0)) {
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
                    onClose: function onClose(options) {
                        set_minConValue(options[0]);
                        set_maxConValue(options[1]);
                        setPageNo(1);
                        setConAPIFlag(options[0] + options[1]);
                    },
                    onDelete: () => {
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
                        min: bottomPerChange,
                        max: topPerChange + 1,
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
                                }
                                if (args[0] === 1) {
                                    setIsOpened(true);
                                    setCurrentButtonId(1);
                                    set_minPerValue(bottomPerChange);
                                    set_maxPerValue(neutralPerChange);
                                }
                                if (args[0] === 2) {
                                    setIsOpened(true);
                                    setCurrentButtonId(2);
                                    set_minPerValue(neutralPerChange);
                                    set_maxPerValue(topPerChange);
                                }
                            }
                        },
                    },
                    isOpened: isopened,
                    onClose: function onClose(options) {
                        set_minPerValue(options[0]);
                        set_maxPerValue(options[1]);
                        setPageNo(1);
                        setIsOpened(false);
                        setPerAPIFlag(options[0] + options[1]);
                    },
                    onDelete: () => {
                        set_minPerValue(bottomPerChange);
                        set_maxPerValue(topPerChange);
                        setPerAPIFlag('');
                    },
                },
                {
                    label: 'Location',
                    value: 'spaces',
                    placeholder: 'All Locations',
                    filterType: FILTER_TYPES.MULTISELECT,
                    filterOptions: filterData.spaces.map((filterItem) => ({
                        value: filterItem.space_id,
                        label: filterItem.space_name,
                    })),
                    onClose: (options) => {},
                    onDelete: () => {
                        setSelectedLocation([]);
                        //setMacTypeFilterString('');
                    },
                },
                {
                    label: 'Equipment Type',
                    value: 'equipments_type',
                    placeholder: 'All Equipment Types',
                    filterType: FILTER_TYPES.MULTISELECT,
                    filterOptions: filterData.equipments_type.map((filterItem) => ({
                        value: filterItem.equipment_type_id,
                        label: filterItem.equipment_type_name,
                    })),
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
                        setSelectedEquipType([]);
                    },
                },
                {
                    label: 'End Uses',
                    value: 'end_users',
                    placeholder: 'All End Uses',
                    filterType: FILTER_TYPES.MULTISELECT,
                    filterOptions: filterData.end_users.map((filterItem) => ({
                        value: filterItem.end_use_id,
                        label: filterItem.end_use_name,
                    })),
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
                        setSelectedEndUse([]);
                    },
                },
                {
                    label: 'Space Type',
                    value: 'location_types',
                    placeholder: 'All Space Types',
                    filterType: FILTER_TYPES.MULTISELECT,
                    filterOptions: filterData.location_types.map((filterItem) => ({
                        value: filterItem.location_type_id,
                        label: filterItem.location_types_name,
                    })),
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
                        setSelectedSpaceType([]);
                    },
                },
            ];
            setFilterOptions(filterOptionsFetched);
        }
    }, [minConValue, maxConValue, minPerValue, maxPerValue]);

    useEffect(() => {
        const updateBreadcrumbStore = () => {
            BreadcrumbStore.update((bs) => {
                let newList = [
                    {
                        label: 'Building View',
                        path: '/explore-page/by-equipment',
                        active: true,
                    },
                ];
                bs.items = newList;
            });
            ComponentStore.update((s) => {
                s.parent = 'explore';
            });
        };
        updateBreadcrumbStore();
        localStorage.removeItem('explorer');
    }, []);

    const fetchExploreChartData = async () => {
        setChartLoading(true);
        let payload = apiRequestBody(startDate, endDate, timeZone);
        let params = `?building_id=${bldgId}&consumption=energy&equipment_id=${equipIdNow}&divisible_by=1000`;
        await fetchExploreEquipmentChart(payload, params)
            .then((res) => {
                let responseData = res.data;
                let data = responseData.data;
                let arr = [];
                arr = allEquipmentList.filter(function (item) {
                    return item.equipment_id === equipIdNow;
                });
                let exploreData = [];
                let sg = '';
                let legendName = '';
                sg = arr[0].location.substring(arr[0].location.indexOf('>') + 1);
                if (sg === '') {
                    legendName = arr[0].equipment_name;
                } else {
                    legendName = arr[0].equipment_name + ' - ' + sg;
                }
                let NulledData = [];
                data.map((ele) => {
                    if (ele[1] === '') {
                        NulledData.push({ x: moment.utc(new Date(ele[0])), y: null });
                    } else {
                        NulledData.push({ x: moment.utc(new Date(ele[0])), y: ele[1] });
                    }
                });
                let recordToInsert = {
                    name: legendName,
                    data: NulledData,
                };
                setSeriesData([...seriesData, recordToInsert]);
                setSelectedEquipmentId('');
                setChartLoading(false);
            })
            .catch((error) => {});
    };

    useEffect(() => {
        if (selectedEquipmentId === '') {
            return;
        }

        fetchExploreChartData();
    }, [selectedEquipmentId, equpimentIdSelection]);

    useEffect(() => {
        if (selectedAllEquipmentId.length === 1) {
            const myTimeout = setTimeout(fetchExploreAllChartData(selectedAllEquipmentId[0]), 100000);
        } else {
            selectedAllEquipmentId.map((ele) => {
                const myTimeout = setTimeout(fetchExploreAllChartData(ele), 100000);
            });
        }
    }, [selectedAllEquipmentId]);

    useEffect(() => {
        if (removeEquipmentId === '') {
            return;
        }
        let arr1 = [];
        arr1 = seriesData.filter(function (item) {
            return item.id !== removeEquipmentId;
        });
        setSeriesData(arr1);
        setSeriesLineData(arr1);
    }, [removeEquipmentId]);

    const dataarr = [];

    const fetchExploreAllChartData = async (id) => {
        let payload = apiRequestBody(startDate, endDate, timeZone);
        let params = `?building_id=${bldgId}&consumption=energy&equipment_id=${id}&divisible_by=1000`;
        await fetchExploreEquipmentChart(payload, params)
            .then((res) => {
                let responseData = res.data;
                let data = responseData.data;
                let arr = [];

                arr = allEquipmentList.filter(function (item) {
                    return item.equipment_id === id;
                });
                let exploreData = [];
                let sg = '';
                let legendName = '';
                sg = arr[0].location.substring(arr[0].location.indexOf('>') + 1);
                if (sg === '') {
                    legendName = arr[0].equipment_name;
                } else {
                    legendName = arr[0].equipment_name + ' - ' + sg;
                }
                let NulledData = [];
                data.map((ele) => {
                    if (ele[1] === '') {
                        NulledData.push({ x: moment.utc(new Date(ele[0])), y: null });
                    } else {
                        NulledData.push({ x: moment.utc(new Date(ele[0])), y: ele[1] });
                    }
                });
                let recordToInsert = {
                    name: legendName,
                    data: NulledData,
                };
                dataarr.push(recordToInsert);
                if (selectedIds.length === dataarr.length) {
                    setSeriesData(dataarr);
                    setSeriesLineData(dataarr);
                }
                setAllEquipmenData(dataarr);
            })
            .catch((error) => {});
    };

    useEffect(() => {
        if (equipmentListArray.length === 0) {
            return;
        }
        for (var i = 0; i < equipmentListArray.length; i++) {
            let arr1 = [];
            arr1 = seriesData.filter(function (item) {
                return item.id === equipmentListArray[i];
            });
            if (arr1.length === 0) {
                fetchExploreAllChartData(equipmentListArray[i]);
            }
        }
    }, [equipmentListArray]);

    useEffect(() => {
        if (allEquipmentData.length === 0) {
            return;
        }
        if (allEquipmentData.length === exploreTableData.length) {
            setSeriesData(allEquipmentData);
            setSeriesLineData(allEquipmentData);
        }
    }, [allEquipmentData]);

    const getCSVLinkData = () => {
        //     let sData = [];
        //     exploreTableData.map(function (obj) {
        //         let change = percentageHandler(obj.consumption.now, obj.consumption.old) + '%';
        //         sData.push([
        //             obj.equipment_name,
        //             (obj.consumption.now / 1000).toFixed(2) + 'kWh',
        //             change,
        //             obj.location,
        //             obj.location_type,
        //             obj.equipments_type,
        //             obj.end_user,
        //         ]);
        //     });
        //     let streamData = exploreTableData.length > 0 ? sData : [];
        //     return [
        //         [
        //             'Name',
        //             'Energy Consumption',
        //             '% Change',
        //             'Location',
        //             'Location Type',
        //             'Equipment Type',
        //             'End Use Category',
        //         ],
        //         ...streamData,
        //     ];
    };

    return (
        <>
            <Row className="ml-2 mr-2 explore-filters-style">
                <Header title="" type="page" />
            </Row>

            <Row>
                <div className="explore-data-table-style p-2 mb-2">
                    {isExploreChartDataLoading ? (
                        <></>
                    ) : (
                        <>
                            <ExploreChart
                                title={''}
                                subTitle={''}
                                data={seriesData}
                                dateRange={fetchDateRange(startDate, endDate)}
                            />
                        </>
                    )}
                </div>
            </Row>

            <Row>
                <div className="explore-data-table-style">
                    <Col lg={12}>
                        <DataTableWidget
                            isLoading={isExploreDataLoading}
                            isLoadingComponent={<SkeletonLoading />}
                            id="explore-by-equipment"
                            onSearch={setSearch}
                            buttonGroupFilterOptions={[]}
                            onStatus={setSelectedEquipmentFilter}
                            rows={currentRow()}
                            searchResultRows={currentRowSearched()}
                            filterOptions={filterOptions}
                            onDownload={(query) => {
                                getCSVLinkData(query);
                            }}
                            headers={[
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
                            ]}
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
                                />
                            )}
                            customCheckboxForCell={(record) => (
                                <Checkbox
                                    label=""
                                    type="checkbox"
                                    id="equip"
                                    name="equip"
                                    checked={selectedIds.includes(record?.equipment_id) || checkedAll}
                                    value={selectedIds.includes(record?.equipment_id) || checkedAll ? true : false}
                                    onChange={(e) => {
                                        handleEquipStateChange(e.target.value, record);
                                    }}
                                />
                            )}
                            onPageSize={setPageSize}
                            onChangePage={setPageNo}
                            pageSize={pageSize}
                            currentPage={pageNo}
                            totalCount={(() => {
                                if (search) {
                                    return totalItemsSearched;
                                }
                                if (selectedEquipmentFilter === 0) {
                                    return totalItems;
                                }

                                return 0;
                            })()}
                        />
                    </Col>
                </div>
            </Row>

            <EquipChartModal
                showEquipmentChart={showEquipmentChart}
                handleChartClose={handleChartClose}
                equipmentFilter={equipmentFilter}
                fetchEquipmentData={exploreDataFetch}
                selectedTab={selectedModalTab}
                setSelectedTab={setSelectedModalTab}
                activePage="explore"
            />
        </>
    );
};

export default ExploreByEquipment;
