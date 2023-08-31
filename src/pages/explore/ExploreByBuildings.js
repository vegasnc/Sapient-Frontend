import React, { useState, useEffect, useRef } from 'react';
import { Row, Col } from 'reactstrap';
import { fetchExploreByBuildingListV2, fetchExploreBuildingChart } from '../explore/services';
import { BreadcrumbStore } from '../../store/BreadcrumbStore';
import { DateRangeStore } from '../../store/DateRangeStore';
import { ComponentStore } from '../../store/ComponentStore';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { useHistory } from 'react-router-dom';
import { selectedBuilding, totalSelectionBuildingId } from '../../store/globalState';
import { useAtom } from 'jotai';
import { timeZone } from '../../utils/helper';
import Header from '../../components/Header';
import { apiRequestBody, dateTimeFormatForHighChart, formatXaxisForHighCharts } from '../../helpers/helpers';
import { DataTableWidget } from '../../sharedComponents/dataTableWidget';
import { Checkbox } from '../../sharedComponents/form/checkbox';
import Brick from '../../sharedComponents/brick';
import { TinyBarChart } from '../../sharedComponents/tinyBarChart';
import { TrendsBadge } from '../../sharedComponents/trendsBadge';
import Typography from '../../sharedComponents/typography';
import { FILTER_TYPES } from '../../sharedComponents/dataTableWidget/constants';
import ExploreChart from '../../sharedComponents/exploreChart/ExploreChart';
import { getExploreByBuildingTableCSVExport } from '../../utils/tablesExport';
import useCSVDownload from '../../sharedComponents/hooks/useCSVDownload';
import { getAverageValue } from '../../helpers/AveragePercent';
import { updateBuildingStore } from '../../helpers/updateBuildingStore';
import { UserStore } from '../../store/UserStore';
import { handleUnitConverstion } from '../settings/general-settings/utils';
import './style.css';

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
        </tr>
    </SkeletonTheme>
);

const ExploreByBuildings = () => {
    const isLoadingRef = useRef(false);
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState({});
    const [allSearchData, setAllSearchData] = useState([]);
    const [totalItems, setTotalItems] = useState(0);
    const [totalItemsSearched, setTotalItemsSearched] = useState(0);
    const [allBuildingList, setAllBuildingList] = useState([]);
    const [selectedBuildingFilter, setSelectedBuildingFilter] = useState(0);
    const [selectedIds, setSelectedIds] = useState([]);
    const [filterOptions, setFilterOptions] = useState([]);
    const { download } = useCSVDownload();
    const [checkedAll, setCheckedAll] = useState(false);
    const [buildIdNow, setBuildIdNow] = useState('');
    const history = useHistory();

    const [buildingIdSelection] = useAtom(selectedBuilding);
    const [totalBuildingId] = useAtom(totalSelectionBuildingId);

    const startDate = DateRangeStore.useState((s) => s.startDate);
    const endDate = DateRangeStore.useState((s) => s.endDate);
    const daysCount = DateRangeStore.useState((s) => +s.daysCount);

    const userPrefUnits = UserStore.useState((s) => s.unit);
    const userPrefDateFormat = UserStore.useState((s) => s.dateFormat);
    const userPrefTimeFormat = UserStore.useState((s) => s.timeFormat);

    const [isExploreDataLoading, setIsExploreDataLoading] = useState(false);
    const [isFilterFetching, setFetchingFilters] = useState(false);
    const [isExploreChartDataLoading, setIsExploreChartDataLoading] = useState(false);
    const [selectedBuildingId, setSelectedBuildingId] = useState('');
    const [seriesData, setSeriesData] = useState([]);
    const [allBuildingData, setAllBuildingData] = useState([]);

    let entryPoint = '';
    let top = '';
    let bottom = '';
    const [topEnergyConsumption, setTopEnergyConsumption] = useState(0);
    const [bottomEnergyConsumption, setBottomEnergyConsumption] = useState(0);
    const [topPerChange, setTopPerChange] = useState(0);
    const [bottomPerChange, setBottomPerChange] = useState(0);
    const [topSquareFootage, setTopSquareFootage] = useState(0);
    const [bottomSquareFootage, setBottomSquareFootage] = useState(0);
    const [selectedAllBuildingId, setSelectedAllBuildingId] = useState([]);

    const [minConValue, set_minConValue] = useState(0);
    const [maxConValue, set_maxConValue] = useState(0);
    const [minPerValue, set_minPerValue] = useState(0);
    const [maxPerValue, set_maxPerValue] = useState(0);
    const [minSqftValue, set_minSqftValue] = useState(0);
    const [maxSqftValue, set_maxSqftValue] = useState(0);
    const [conAPIFlag, setConAPIFlag] = useState('');
    const [perAPIFlag, setPerAPIFlag] = useState('');
    const [sqftAPIFlag, setSqftAPIFlag] = useState('');
    const [selectedBuildingType, setSelectedBuildingType] = useState([]);
    const [buildingTypeList, setBuildingTypeList] = useState([]);
    const [currentButtonId, setCurrentButtonId] = useState(0);
    const [isopened, setIsOpened] = useState(false);
    const [topVal, setTopVal] = useState(0);
    const [bottomVal, setBottomVal] = useState(0);
    const [shouldRender, setShouldRender] = useState(true);

    const updateBreadcrumbStore = () => {
        BreadcrumbStore.update((bs) => {
            let newList = [
                {
                    label: 'Portfolio Level',
                    path: '/explore-page/by-buildings',
                    active: true,
                },
            ];
            bs.items = newList;
        });
        ComponentStore.update((s) => {
            s.parent = 'explore';
        });

        updateBuildingStore('portfolio', 'Portfolio', '');
    };

    useEffect(() => {
        entryPoint = 'entered';
    }, []);

    useEffect(() => {
        if (selectedIds?.length >= 1) {
            let arr = [];
            for (let i = 0; i < selectedIds?.length; i++) {
                arr.push(selectedIds[i]);
            }
            setSeriesData([]);
            setSelectedAllBuildingId(arr);
        } else {
            setSelectedBuildingId('');
        }
    }, [startDate, endDate]);

    useEffect(() => {
        updateBreadcrumbStore();
        localStorage.removeItem('explorer');
    }, []);

    const exploreByBuildingDataFetch = async () => {
        setFetchingFilters(true);
        isLoadingRef.current = true;
        setIsExploreDataLoading(true);

        const ordered_by = sortBy.name === undefined || sortBy.method === null ? 'total_consumption' : sortBy.name;
        const sort_by = sortBy.method === undefined || sortBy.method === null ? 'dce' : sortBy.method;
        const start_date = encodeURIComponent(startDate);
        const end_date = encodeURIComponent(endDate);

        let params = `?date_from=${start_date}&date_to=${end_date}&tz_info=${timeZone}&metric=energy`;

        if (search) params = params.concat(`&building_search=${encodeURIComponent(search)}`);
        if (ordered_by) params = params.concat(`&ordered_by=${ordered_by}`);
        if (sort_by) params = params.concat(`&sort_by=${sort_by}`);
        if (selectedBuildingType.length !== 0) {
            const buildingTypesSelected = encodeURIComponent(selectedBuildingType.join('+'));
            params.concat(`&building_type=${buildingTypesSelected}`);
        }

        if (conAPIFlag !== '') {
            const gte = (minConValue - 1) * 1000;
            const lte = (maxConValue + 1) * 1000;
            params.concat(`&energy_consumption_lte=${lte}&energy_consumption_gte=${gte}`);
        }

        if (perAPIFlag !== '') {
            const gte = minPerValue - 0.5;
            const lte = maxPerValue + 0.5;
            params.concat(`&change_lte=${lte}&change_gte=${gte}`);
        }

        if (sqftAPIFlag !== '') {
            const gte = minSqftValue;
            const lte = maxSqftValue;
            params.concat(`&square_footage_lte=${lte}&square_footage_gte=${gte}`);
        }

        await fetchExploreByBuildingListV2(params)
            .then((res) => {
                if (entryPoint === 'entered') {
                    totalBuildingId.length = 0;
                    setSeriesData([]);
                }
                let responseData = res?.data?.data;
                if (responseData.length !== 0) {
                    responseData.forEach((el) => {
                        el.user_pref_units = userPrefUnits;
                    });
                }
                setAllBuildingList(responseData);
                setTotalItems(responseData.length);
                const uniqueIds = [];
                const uniqueBuildingTypes = responseData.filter((element) => {
                    const isDuplicate = uniqueIds.includes(element.building_type);
                    if (!isDuplicate) {
                        uniqueIds.push(element.building_type);
                        return true;
                    }
                    return false;
                });
                setBuildingTypeList(uniqueBuildingTypes);
                const squareFootage =
                    userPrefUnits === `si`
                        ? Math.round(handleUnitConverstion(responseData[0].square_footage, userPrefUnits))
                        : responseData[0].square_footage;
                let topConsumption = responseData[0].energy_consumption.now;
                let bottomConsumption = responseData[0].energy_consumption.now;
                let topChange = responseData[0].energy_consumption.change;
                let bottomChange = responseData[0].energy_consumption.change;
                let topSqft = squareFootage;
                let bottomSqft = squareFootage;
                responseData.map((ele) => {
                    if (Number(ele.energy_consumption.now) > topConsumption)
                        topConsumption = ele.energy_consumption.now;
                    if (Number(ele.energy_consumption.now) < bottomConsumption)
                        bottomConsumption = ele.energy_consumption.now;
                    if (Number(ele.energy_consumption.change) > topChange) topChange = ele.energy_consumption.change;
                    if (Number(ele.energy_consumption.change) < bottomChange)
                        bottomChange = ele.energy_consumption.change;
                    if (Number(ele.square_footage) > topSqft)
                        topSqft = Math.round(handleUnitConverstion(ele.square_footage, userPrefUnits));
                    if (Number(ele.square_footage) < bottomSqft)
                        bottomSqft = Math.round(handleUnitConverstion(ele.square_footage, userPrefUnits));
                });
                top = topConsumption / 1000;
                bottom = bottomConsumption / 1000;
                if (top === bottom) {
                    bottom = 0;
                }
                set_minConValue(Math.abs(Math.round(bottomConsumption / 1000)));
                setBottomEnergyConsumption(Math.abs(Math.round(bottomConsumption / 1000)));
                set_maxConValue(
                    Math.abs(
                        topConsumption === bottomConsumption
                            ? Math.round(topConsumption / 1000) + 1
                            : Math.round(topConsumption / 1000)
                    )
                );
                setTopVal(Math.round(topChange));
                setBottomVal(Math.round(bottomChange));
                setTopEnergyConsumption(Math.abs(Math.round(topConsumption / 1000)));
                set_minPerValue(Math.round(bottomChange));
                setBottomPerChange(Math.round(bottomChange));
                set_maxPerValue(topChange === bottomChange ? Math.round(topChange) + 1 : Math.round(topChange));
                setTopPerChange(Math.round(topChange));
                set_minSqftValue(Math.abs(Math.round(bottomSqft)));
                setBottomSquareFootage(Math.abs(Math.round(bottomSqft)));
                setTopSquareFootage(Math.abs(Math.round(topSqft)));
                set_maxSqftValue(Math.abs(topSqft === bottomSqft ? Math.round(topSqft) + 1 : Math.round(topSqft)));
                isLoadingRef.current = false;
                setIsExploreDataLoading(false);
                setFetchingFilters(false);
            })
            .catch((error) => {
                isLoadingRef.current = false;
                setIsExploreDataLoading(false);
                setFetchingFilters(false);
            });
    };

    useEffect(() => {
        if (startDate === null || endDate === null) return;

        if (conAPIFlag === '' && perAPIFlag === '' && sqftAPIFlag === '' && selectedBuildingType.length === 0) {
            exploreByBuildingDataFetch();
        } else {
            filterexploreDataFetch();
        }
    }, [
        startDate,
        endDate,
        sortBy.method,
        sortBy.name,
        conAPIFlag,
        perAPIFlag,
        sqftAPIFlag,
        selectedBuildingType,
        userPrefUnits,
    ]);

    useEffect(() => {
        if (
            (minConValue !== maxConValue && maxConValue !== 0) ||
            (minPerValue !== maxPerValue && maxPerValue !== 0) ||
            (minSqftValue !== maxSqftValue && maxSqftValue !== 0)
        ) {
            const filterOptionsFetched = [
                {
                    label: 'Energy Consumption',
                    value: 'energy_consumption',
                    placeholder: 'All Consumptions',
                    filterType: FILTER_TYPES.RANGE_SELECTOR,
                    filterOptions: [minConValue, maxConValue],
                    componentProps: {
                        prefix: ' kWh',
                        title: 'Consumption',
                        min: bottomEnergyConsumption,
                        max: topEnergyConsumption + 1,
                        range: [minConValue, maxConValue],
                        withTrendsFilter: false,
                    },
                    onClose: function onClose(options) {
                        set_minConValue(options[0]);
                        set_maxConValue(options[1]);
                        setConAPIFlag(options[0] + options[1]);
                    },
                    onDelete: () => {
                        set_minConValue(bottomEnergyConsumption);
                        set_maxConValue(topEnergyConsumption);
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
                                    setBottomVal(bottomPerChange);
                                    setTopVal(topPerChange + 1);
                                    set_minPerValue(bottomPerChange);
                                    set_maxPerValue(topPerChange + 1);
                                }
                                if (args[0] === 1) {
                                    setIsOpened(true);
                                    setCurrentButtonId(1);
                                    if (bottomPerChange < 0) {
                                        setBottomVal(bottomPerChange);
                                        setTopVal(0);
                                        set_minPerValue(bottomPerChange);
                                        set_maxPerValue(0);
                                    } else if (bottomPerChange >= 0) {
                                        setBottomVal(0);
                                        setTopVal(1);
                                        set_minPerValue(0);
                                        set_maxPerValue(0);
                                    }
                                }
                                if (args[0] === 2) {
                                    setIsOpened(true);
                                    setCurrentButtonId(2);
                                    if (topPerChange > 0) {
                                        setBottomVal(0);
                                        setTopVal(topPerChange);
                                        set_minPerValue(0);
                                        set_maxPerValue(topPerChange);
                                    } else if (bottomPerChange >= 0) {
                                        setBottomVal(0);
                                        setTopVal(1);
                                        set_minPerValue(0);
                                        set_maxPerValue(0);
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
                        setPerAPIFlag(options[0] + options[1]);
                    },
                    onDelete: () => {
                        set_minPerValue(bottomPerChange);
                        set_maxPerValue(topPerChange);
                        setPerAPIFlag('');
                    },
                },
                {
                    label: `${userPrefUnits === 'si' ? `Square Meter` : `Square Footage`}`,
                    value: 'square_footage',
                    placeholder: `All ${userPrefUnits === 'si' ? `Square Meter` : `Square Footage`}`,
                    filterType: FILTER_TYPES.RANGE_SELECTOR,
                    filterOptions: [minSqftValue, maxSqftValue],
                    componentProps: {
                        prefix: ` ${userPrefUnits === 'si' ? `sq.m.` : `sq.ft.`}`,
                        title: `${userPrefUnits === 'si' ? `Square Meter` : `Square Footage`}`,
                        min: bottomSquareFootage,
                        max: topSquareFootage + 1,
                        range: [minSqftValue, maxSqftValue],
                        withTrendsFilter: false,
                    },
                    onClose: function onClose(options) {
                        set_minSqftValue(options[0]);
                        set_maxSqftValue(options[1]);
                        setSqftAPIFlag(options[0] + options[1]);
                    },
                    onDelete: () => {
                        set_minSqftValue(bottomSquareFootage);
                        set_maxSqftValue(topSquareFootage);
                        setSqftAPIFlag('');
                    },
                },
                {
                    label: 'Building Type',
                    value: 'building_type',
                    placeholder: 'All Building Types',
                    filterType: FILTER_TYPES.MULTISELECT,
                    filterOptions: buildingTypeList.map((filterItem) => ({
                        value: filterItem?.building_id,
                        label: filterItem?.building_type,
                    })),
                    onClose: (options) => {
                        let opt = options;
                        if (opt.length !== 0) {
                            let buildingType = [];
                            for (let i = 0; i < opt.length; i++) {
                                buildingType.push(opt[i].value);
                            }
                            setSelectedBuildingType(buildingType);
                        }
                    },
                    onDelete: () => {
                        setSelectedBuildingType([]);
                    },
                },
            ];
            setFilterOptions(filterOptionsFetched);
        }
    }, [minConValue, maxConValue, minPerValue, maxPerValue, minSqftValue, maxSqftValue, userPrefUnits]);

    useEffect(() => {
        if (perAPIFlag !== '') {
            const filterOptionsFetched = [
                {
                    label: 'Energy Consumption',
                    value: 'energy_consumption',
                    placeholder: 'All Consumptions',
                    filterType: FILTER_TYPES.RANGE_SELECTOR,
                    filterOptions: [minConValue, maxConValue],
                    componentProps: {
                        prefix: ' kWh',
                        title: 'Consumption',
                        min: bottomEnergyConsumption,
                        max: topEnergyConsumption + 1,
                        range: [minConValue, maxConValue],
                        withTrendsFilter: false,
                    },
                    onClose: function onClose(options) {
                        set_minConValue(options[0]);
                        set_maxConValue(options[1]);
                        setConAPIFlag(options[0] + options[1]);
                    },
                    onDelete: () => {
                        set_minConValue(bottomEnergyConsumption);
                        set_maxConValue(topEnergyConsumption);
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
                                    setBottomVal(bottomPerChange);
                                    setTopVal(topPerChange + 1);
                                    set_minPerValue(bottomPerChange);
                                    set_maxPerValue(topPerChange + 1);
                                }
                                if (args[0] === 1) {
                                    setIsOpened(true);
                                    setCurrentButtonId(1);
                                    if (bottomPerChange < 0) {
                                        setBottomVal(bottomPerChange);
                                        setTopVal(0);
                                        set_minPerValue(bottomPerChange);
                                        set_maxPerValue(0);
                                    } else if (bottomPerChange >= 0) {
                                        setBottomVal(0);
                                        setTopVal(1);
                                        set_minPerValue(0);
                                        set_maxPerValue(0);
                                    }
                                }
                                if (args[0] === 2) {
                                    setIsOpened(true);
                                    setCurrentButtonId(2);
                                    if (topPerChange > 0) {
                                        setBottomVal(0);
                                        setTopVal(topPerChange);
                                        set_minPerValue(0);
                                        set_maxPerValue(topPerChange);
                                    } else if (bottomPerChange >= 0) {
                                        setBottomVal(0);
                                        setTopVal(1);
                                        set_minPerValue(0);
                                        set_maxPerValue(0);
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
                        setPerAPIFlag(options[0] + options[1]);
                    },
                    onDelete: () => {
                        set_minPerValue(bottomPerChange);
                        set_maxPerValue(topPerChange);
                        setPerAPIFlag('');
                    },
                },
                {
                    label: 'Square Footage',
                    value: 'square_footage',
                    placeholder: 'All Square Footage',
                    filterType: FILTER_TYPES.RANGE_SELECTOR,
                    filterOptions: [minSqftValue, maxSqftValue],
                    componentProps: {
                        prefix: ' sq.ft.',
                        title: 'Square Footage',
                        min: bottomSquareFootage,
                        max: topSquareFootage + 1,
                        range: [minSqftValue, maxSqftValue],
                        withTrendsFilter: false,
                    },
                    onClose: function onClose(options) {
                        set_minSqftValue(options[0]);
                        set_maxSqftValue(options[1]);
                        setSqftAPIFlag(options[0] + options[1]);
                    },
                    onDelete: () => {
                        set_minSqftValue(bottomSquareFootage);
                        set_maxSqftValue(topSquareFootage);
                        setSqftAPIFlag('');
                    },
                },
                {
                    label: 'Building Type',
                    value: 'building_type',
                    placeholder: 'All Building Types',
                    filterType: FILTER_TYPES.MULTISELECT,
                    filterOptions: buildingTypeList.map((filterItem) => ({
                        value: filterItem.building_type,
                        label: filterItem.building_type,
                    })),
                    onClose: (options) => {
                        let opt = options;
                        if (opt.length !== 0) {
                            let buildingType = [];
                            for (let i = 0; i < opt.length; i++) {
                                buildingType.push(opt[i].value);
                            }
                            setSelectedBuildingType(buildingType);
                        }
                    },
                    onDelete: () => {
                        setSelectedBuildingType([]);
                    },
                },
            ];
            setFilterOptions(filterOptionsFetched);
        }
    }, [perAPIFlag]);

    const filterexploreDataFetch = async () => {
        isLoadingRef.current = true;
        setIsExploreDataLoading(true);

        const ordered_by = sortBy.name === undefined || sortBy.method === null ? 'total_consumption' : sortBy.name;
        const sort_by = sortBy.method === undefined || sortBy.method === null ? 'dce' : sortBy.method;
        const start_date = encodeURIComponent(startDate);
        const end_date = encodeURIComponent(endDate);

        let params = `?date_from=${start_date}&date_to=${end_date}&tz_info=${timeZone}&metric=energy`;

        if (search) params = params.concat(`&building_search=${encodeURIComponent(search)}`);
        if (ordered_by) params = params.concat(`&ordered_by=${ordered_by}`);
        if (sort_by) params = params.concat(`&sort_by=${sort_by}`);
        if (selectedBuildingType.length !== 0) {
            const buildingTypesSelected = encodeURIComponent(selectedBuildingType.join('+'));
            params = params.concat(`&building_type=${buildingTypesSelected}`);
        }

        if (conAPIFlag !== '') {
            const gte = (minConValue - 1) * 1000;
            const lte = (maxConValue + 1) * 1000;
            params = params.concat(`&energy_consumption_lte=${lte}&energy_consumption_gte=${gte}`);
        }

        if (perAPIFlag !== '') {
            const gte = minPerValue - 0.5;
            const lte = maxPerValue + 0.5;
            params = params.concat(`&change_lte=${lte}&change_gte=${gte}`);
        }

        if (sqftAPIFlag !== '') {
            const gte = minSqftValue;
            const lte = maxSqftValue;
            params = params.concat(`&square_footage_lte=${lte}&square_footage_gte=${gte}`);
        }

        await fetchExploreByBuildingListV2(params)
            .then((res) => {
                let responseData = res?.data?.data;
                if (responseData.length !== 0) {
                    responseData.forEach((el) => {
                        el.user_pref_units = userPrefUnits;
                    });
                }

                setAllBuildingList(responseData);
                setTotalItems(responseData.length);
                setTopEnergyConsumption(responseData[0]?.energy_consumption?.now);
                isLoadingRef.current = false;
                setIsExploreDataLoading(false);
            })
            .catch((error) => {
                isLoadingRef.current = false;
                setIsExploreDataLoading(false);
            });
    };

    const currentRow = () => {
        if (selectedBuildingFilter === 0) {
            return allBuildingList;
        }
        if (selectedBuildingFilter === 1) {
            return selectedIds.reduce((acc, id) => {
                const foundSelectedBuilding = allBuildingList.find((blgd) => blgd.building_id === id);
                if (foundSelectedBuilding) {
                    acc.push(foundSelectedBuilding);
                }
                return acc;
            }, []);
        }
        return allBuildingList.filter(({ building_id }) => !selectedIds.find((blgd) => blgd === building_id));
    };

    const currentRowSearched = () => {
        if (selectedBuildingFilter === 0) {
            return allSearchData;
        }
        if (selectedBuildingFilter === 1) {
            return selectedIds.reduce((acc, id) => {
                const foundSelectedBuilding = allSearchData.find((blgd) => blgd.building_id === id);
                if (foundSelectedBuilding) {
                    acc.push(foundSelectedBuilding);
                }
                return acc;
            }, []);
        }
        return allSearchData.filter(({ id }) => !selectedIds.find((blgd) => blgd === id));
    };

    const renderBuildingName = (row) => {
        return (
            <div style={{ fontSize: 0 }}>
                <a
                    className="typography-wrapper link mouse-pointer"
                    onClick={() => {
                        redirectToExploreEquipPage(row?.building_id, row?.building_name, row?.timezone, row?.plug_only);
                    }}>
                    {row?.building_name}
                </a>
                <Brick sizeInPixels={3} />
            </div>
        );
    };

    const renderSquareFootage = (row) => {
        const value = Math.round(handleUnitConverstion(row?.square_footage, row?.user_pref_units));
        const unit = `${row?.user_pref_units === `si` ? `Sq.M.` : `Sq.Ft.`}`;
        return <Typography.Body size={Typography.Sizes.sm}>{`${value} ${unit}`}</Typography.Body>;
    };

    const renderConsumption = (row) => {
        return (
            <>
                <Typography.Body size={Typography.Sizes.sm}>
                    {Math.round(row?.energy_consumption?.now / 1000)} kWh
                </Typography.Body>
                <Brick sizeInRem={0.375} />
                <TinyBarChart percent={getAverageValue(row?.energy_consumption.now / 1000, bottom, top)} />
            </>
        );
    };

    const renderPerChange = (row) => {
        return (
            <TrendsBadge
                value={Math.abs(Math.round(row?.energy_consumption?.change))}
                type={
                    row?.energy_consumption?.now < row?.energy_consumption?.old
                        ? TrendsBadge.Type.DOWNWARD_TREND
                        : TrendsBadge.Type.UPWARD_TREND
                }
            />
        );
    };

    const redirectToExploreEquipPage = (bldId, bldName, bldTimeZone, isPlugOnly) => {
        updateBuildingStore(bldId, bldName, bldTimeZone, isPlugOnly);

        history.push({
            pathname: `/explore-page/by-equipment/${bldId}`,
        });
    };

    useEffect(() => {
        setAllSearchData([]);

        const fetchAllData = async () => {
            isLoadingRef.current = true;
            setIsExploreDataLoading(true);

            const ordered_by = sortBy.name === undefined || sortBy.method === null ? 'total_consumption' : sortBy.name;
            const sort_by = sortBy.method === undefined || sortBy.method === null ? 'dce' : sortBy.method;
            const start_date = encodeURIComponent(startDate);
            const end_date = encodeURIComponent(endDate);

            let params = `?date_from=${start_date}&date_to=${end_date}&tz_info=${timeZone}&metric=energy`;

            if (search) params = params.concat(`&building_search=${encodeURIComponent(search)}`);
            if (ordered_by) params = params.concat(`&ordered_by=${ordered_by}`);
            if (sort_by) params = params.concat(`&sort_by=${sort_by}`);
            if (selectedBuildingType.length !== 0) {
                const buildingTypesSelected = encodeURIComponent(selectedBuildingType.join('+'));
                params.concat(`&building_type=${buildingTypesSelected}`);
            }

            if (conAPIFlag !== '') {
                const gte = (minConValue - 1) * 1000;
                const lte = (maxConValue + 1) * 1000;
                params.concat(`&energy_consumption_lte=${lte}&energy_consumption_gte=${gte}`);
            }

            if (perAPIFlag !== '') {
                const gte = minPerValue - 0.5;
                const lte = maxPerValue + 0.5;
                params.concat(`&change_lte=${lte}&change_gte=${gte}`);
            }

            if (sqftAPIFlag !== '') {
                const gte = minSqftValue;
                const lte = maxSqftValue;
                params.concat(`&square_footage_lte=${lte}&square_footage_gte=${gte}`);
            }

            await fetchExploreByBuildingListV2(params)
                .then((res) => {
                    if (entryPoint === 'entered') {
                        totalBuildingId.length = 0;
                        setSeriesData([]);
                    }
                    let responseData = res.data;
                    setTotalItemsSearched(responseData.length);
                    setAllSearchData(responseData);
                    isLoadingRef.current = false;
                    setIsExploreDataLoading(false);
                })
                .catch((error) => {
                    isLoadingRef.current = false;
                    setIsExploreDataLoading(false);
                });
        };
        search && fetchAllData();
    }, [search, startDate, endDate, sortBy.method, sortBy.name]);

    const handleBuildingStateChange = (value, build) => {
        if (value === 'true') {
            let arr1 = seriesData.filter(function (item) {
                return item.id !== build?.building_id;
            });
            setSeriesData(arr1);
            setBuildIdNow('');
        }
        if (value === 'false') {
            setBuildIdNow(build?.building_id);
        }
        const isAdding = value === 'false';
        setSelectedIds((prevState) => {
            return isAdding
                ? [...prevState, build.building_id]
                : prevState.filter((buildId) => buildId !== build.building_id);
        });
    };

    const [tableHeader, setTableHeader] = useState([
        {
            name: 'Name',
            accessor: 'building_name',
            callbackValue: renderBuildingName,
            onSort: (method, name) => setSortBy({ method, name }),
        },
        {
            name: 'Energy Consumption',
            accessor: 'energy_consumption',
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
            name: 'Square Footage',
            accessor: 'square_footage',
            callbackValue: renderSquareFootage,
            onSort: (method, name) => setSortBy({ method, name }),
        },
        {
            name: 'Building Type',
            accessor: 'building_type',
            onSort: (method, name) => setSortBy({ method, name }),
        },
    ]);

    const handleDownloadCsv = async () => {
        const ordered_by = sortBy.name === undefined || sortBy.method === null ? 'total_consumption' : sortBy.name;
        const sort_by = sortBy.method === undefined || sortBy.method === null ? 'dce' : sortBy.method;
        const start_date = encodeURIComponent(startDate);
        const end_date = encodeURIComponent(endDate);

        let params = `?date_from=${start_date}&date_to=${end_date}&tz_info=${timeZone}&metric=energy`;

        if (ordered_by) params = params.concat(`&ordered_by=${ordered_by}`);
        if (sort_by) params = params.concat(`&sort_by=${sort_by}`);

        await fetchExploreByBuildingListV2(params)
            .then((res) => {
                let responseData = res?.data?.data;
                download(
                    `Explore_By_Building_${new Date().toISOString().split('T')[0]}`,
                    getExploreByBuildingTableCSVExport(responseData, tableHeader, userPrefUnits)
                );
            })
            .catch((error) => {});
    };

    useEffect(() => {
        if (userPrefUnits) {
            let newHeaderList = tableHeader;
            newHeaderList.forEach((record) => {
                if (record?.accessor === 'square_footage') {
                    record.name = `${userPrefUnits === 'si' ? `Square Meter` : `Square Footage`}`;
                }
            });
            setTableHeader(newHeaderList);
            setShouldRender((prev) => !prev); // This is set to trigger re-render for DataTableWidget component
        }
    }, [userPrefUnits]);

    useEffect(() => {
        if (buildIdNow) {
            fetchExploreChartData();
        }
    }, [buildIdNow]);

    const fetchExploreChartData = async (id) => {
        let value = apiRequestBody(startDate, endDate, timeZone);
        await fetchExploreBuildingChart(value, buildIdNow)
            .then((res) => {
                let responseData = res.data;
                let data = responseData.data;
                let arr = [];
                arr = allBuildingList.filter(function (item) {
                    return item.building_id === buildIdNow;
                });
                let NulledData = [];
                data.map((ele) => {
                    if (ele.energy_consumption === '') {
                        NulledData.push({ x: new Date(ele.time_stamp).getTime(), y: null });
                    } else {
                        NulledData.push({ x: new Date(ele.time_stamp).getTime(), y: ele.energy_consumption });
                    }
                });
                let recordToInsert = {
                    name: arr[0]?.building_name,
                    data: NulledData,
                    id: arr[0]?.building_id,
                };
                setSeriesData([...seriesData, recordToInsert]);
            })
            .catch((error) => {});
    };

    const dataarr = [];

    const fetchExploreAllChartData = async (id) => {
        let value = apiRequestBody(startDate, endDate, timeZone);
        await fetchExploreBuildingChart(value, id)
            .then((res) => {
                let responseData = res.data;
                let data = responseData.data;
                let arr = [];
                arr = allBuildingList.filter(function (item) {
                    return item.building_id === id;
                });
                let NulledData = [];
                data.map((ele) => {
                    if (ele?.energy_consumption === '') {
                        NulledData.push({ x: new Date(ele.time_stamp).getTime(), y: null });
                    } else {
                        NulledData.push({ x: new Date(ele.time_stamp).getTime(), y: ele?.energy_consumption });
                    }
                });
                let recordToInsert = {
                    name: arr[0]?.building_name,
                    data: NulledData,
                    id: arr[0]?.building_id,
                };
                dataarr.push(recordToInsert);
                if (selectedIds.length === dataarr.length) {
                    setSeriesData(dataarr);
                }
            })
            .catch((error) => {});
    };

    useEffect(() => {
        if (selectedAllBuildingId.length === 1) {
            fetchExploreAllChartData(selectedAllBuildingId[0]);
        } else {
            selectedAllBuildingId.map((ele) => {
                fetchExploreAllChartData(ele);
            });
        }
    }, [selectedAllBuildingId]);

    useEffect(() => {
        if (allBuildingData.length === 0) {
            return;
        }
        setSeriesData(allBuildingData);
    }, [allBuildingData]);

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
                                tooltipUnit="KWh"
                                tooltipLabel="Energy Consumption"
                                data={seriesData}
                                // dateRange={fetchDateRange(startDate, endDate)}
                                chartProps={{
                                    navigator: {
                                        outlineWidth: 0,
                                        adaptToUpdatedData: false,
                                        stickToMax: true,
                                    },
                                    tooltip: {
                                        xDateFormat: dateTimeFormatForHighChart(userPrefDateFormat, userPrefTimeFormat),
                                    },
                                    xAxis: {
                                        type: 'datetime',
                                        labels: {
                                            format: formatXaxisForHighCharts(
                                                daysCount,
                                                userPrefDateFormat,
                                                userPrefTimeFormat
                                            ),
                                        },
                                    },
                                }}
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
                            isFilterLoading={isFilterFetching}
                            id="explore-by-building"
                            onSearch={setSearch}
                            buttonGroupFilterOptions={[]}
                            onStatus={setSelectedBuildingFilter}
                            rows={currentRow()}
                            searchResultRows={currentRowSearched()}
                            filterOptions={filterOptions}
                            onDownload={() => handleDownloadCsv()}
                            headers={tableHeader}
                            customCheckAll={() => (
                                <Checkbox
                                    label=""
                                    type="checkbox"
                                    id="building1"
                                    name="building1"
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
                                    id="building_check"
                                    name="building_check"
                                    checked={selectedIds.includes(record?.building_id) || checkedAll}
                                    value={selectedIds.includes(record?.building_id) || checkedAll ? true : false}
                                    onChange={(e) => {
                                        handleBuildingStateChange(e.target.value, record);
                                    }}
                                />
                            )}
                            totalCount={(() => {
                                if (search) {
                                    return totalItemsSearched;
                                }
                                if (selectedBuildingFilter === 0) {
                                    return totalItems;
                                }

                                return 0;
                            })()}
                        />
                    </Col>
                </div>
            </Row>
        </>
    );
};

export default ExploreByBuildings;
