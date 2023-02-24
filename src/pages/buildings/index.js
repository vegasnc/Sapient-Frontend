import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import 'react-loading-skeleton/dist/skeleton.css';
import { ComponentStore } from '../../store/ComponentStore';
import { apiRequestBody, formatConsumptionValue, xaxisFilters } from '../../helpers/helpers';
import { useAtom } from 'jotai';
import moment from 'moment';
import 'moment-timezone';
import { useHistory, useParams } from 'react-router-dom';
import {
    fetchOverallBldgData,
    fetchBuildingEquipments,
    fetchBuilidingHourly,
    fetchEnergyConsumption,
    fetchEndUseByBuilding,
} from '../buildings/services';
import { percentageHandler } from '../../utils/helper';
import { BreadcrumbStore } from '../../store/BreadcrumbStore';
import { DateRangeStore } from '../../store/DateRangeStore';
import { BuildingStore } from '../../store/BuildingStore';
import { buildingData } from '../../store/globalState';
import BuildingKPIs from './BuildingKPIs';
import TotalEnergyConsumption from '../../sharedComponents/totalEnergyConsumption';
import EnergyConsumptionByEndUse from '../../sharedComponents/energyConsumptionByEndUse';
import HourlyAvgConsumption from './HourlyAvgConsumption';
import TopConsumptionWidget from '../../sharedComponents/topConsumptionWidget/TopConsumptionWidget';
import { UNITS } from '../../constants/units';
import { TRENDS_BADGE_TYPES } from '../../sharedComponents/trendsBadge';
import './style.css';
import EquipChartModal from '../chartModal/EquipChartModal';

const BuildingOverview = () => {
    const { bldgId } = useParams();
    const timeZone = BuildingStore.useState((s) => s.BldgTimeZone);
    const history = useHistory();
    const [buildingListData] = useAtom(buildingData);

    const startDate = DateRangeStore.useState((s) => new Date(s.startDate));
    const endDate = DateRangeStore.useState((s) => new Date(s.endDate));
    const startEndDayCount = DateRangeStore.useState((s) => +s.daysCount);

    const [overallBldgData, setOverallBldgData] = useState({
        total_building: 0,
        portfolio_rank: '10 of 50',
        total_consumption: {
            now: 0,
            old: 0,
        },
        average_energy_density: {
            now: 0,
            old: 0,
        },
        yearly_electric_eui: {
            now: 0,
            old: 0,
        },
    });

    const [isPlugOnly, setIsPlugOnly] = useState(false);
    const [buildingConsumptionChartData, setBuildingConsumptionChartData] = useState([]);
    const [isEnergyConsumptionDataLoading, setIsEnergyConsumptionDataLoading] = useState(false);
    const [isAvgConsumptionDataLoading, setIsAvgConsumptionDataLoading] = useState(false);

    const [hourlyAvgConsumpData, setHourlyAvgConsumpData] = useState([]);

    const heatMapChartHeight = 125;

    const [energyConsumption, setEnergyConsumption] = useState([]);

    const [topEnergyConsumptionData, setTopEnergyConsumptionData] = useState([]);

    //EquipChartModel
    const [equipmentFilter, setEquipmentFilter] = useState({});
    const [selectedModalTab, setSelectedModalTab] = useState(0);
    const [showEquipmentChart, setShowEquipmentChart] = useState(false);
    const handleChartOpen = () => setShowEquipmentChart(true);
    const handleChartClose = () => setShowEquipmentChart(false);

    const fetchTrendBadgeType = (now, old) => {
        if (now > old) {
            return TRENDS_BADGE_TYPES.UPWARD_TREND;
        }
        if (now < old) {
            return TRENDS_BADGE_TYPES.DOWNWARD_TREND;
        }
    };

    const getAverageValue = (value, min, max) => {
        if (min == undefined || max === undefined) {
            return 0;
        }
        let percentage = Math.round(((value - min) / (max - min)) * 100);
        return isNaN(percentage) ? 0 : Math.round(percentage);
    };

    const handleRouteChange = (path) => {
        history.push({
            pathname: `${path}/${bldgId}`,
        });
    };

    const handleClick = (row) => {
        let arr = topEnergyConsumptionData.filter((item) => item.label === row);
        setEquipmentFilter({
            equipment_id: arr[0]?.id,
            equipment_name: arr[0]?.label,
        });
        localStorage.setItem('exploreEquipName', arr[0]?.label);
        handleChartOpen();
    };

    const builidingEquipmentsData = async () => {
        let time_zone = 'US/Eastern';
        if (bldgId && buildingListData.length !== 0) {
            const bldgObj = buildingListData.find((el) => el?.building_id === bldgId);
            time_zone = bldgObj?.timezone;
        }
        const payload = apiRequestBody(startDate, endDate, time_zone);
        await fetchBuildingEquipments(bldgId, payload)
            .then((res) => {
                let response = res.data[0].top_contributors;
                let topEnergyData = [];
                response.forEach((record) => {
                    let obj = {
                        link: '#',
                        id: record?.equipment_id,
                        label: record?.equipment_name,
                        value: Math.round(record?.energy_consumption.now / 1000),
                        unit: UNITS.KWH,
                        badgePercentage: percentageHandler(
                            record?.energy_consumption.now,
                            record?.energy_consumption.old
                        ),
                        badgeType: fetchTrendBadgeType(record?.energy_consumption.now, record?.energy_consumption.old),
                    };
                    topEnergyData.push(obj);
                });
                setTopEnergyConsumptionData(topEnergyData);
            })
            .catch((error) => {});
    };

    const pageDefaultState = () => {
        BreadcrumbStore.update((bs) => {
            let newList = [
                {
                    label: 'Building Overview',
                    path: '/energy/building/overview',
                    active: true,
                },
            ];
            bs.items = newList;
        });
        ComponentStore.update((s) => {
            s.parent = 'buildings';
        });
    };

    useEffect(() => {
        if (startDate === null || endDate === null) return;

        let time_zone = 'US/Eastern';

        if (bldgId) {
            const bldgObj = buildingListData.find((el) => el?.building_id === bldgId);

            if (bldgObj?.building_id) {
                if (bldgObj?.timezone) time_zone = bldgObj?.timezone;

                BuildingStore.update((s) => {
                    s.BldgId = bldgObj?.building_id;
                    s.BldgName = bldgObj?.building_name;
                    s.BldgTimeZone = bldgObj?.timezone ? bldgObj?.timezone : 'US/Eastern';
                });
            }
        }

        const buildingOverallData = async () => {
            let payload = apiRequestBody(startDate, endDate, time_zone);
            await fetchOverallBldgData(bldgId, payload)
                .then((res) => {
                    setOverallBldgData(res.data);
                })
                .catch((error) => {});
        };

        const buildingEndUserData = async () => {
            const params = `?building_id=${bldgId}&off_hours=false`;
            const payload = apiRequestBody(startDate, endDate, time_zone);
            await fetchEndUseByBuilding(params, payload)
                .then((res) => {
                    const response = res?.data?.data;
                    response.sort((a, b) => b?.energy_consumption.now - a?.energy_consumption.now);
                    setEnergyConsumption(response);
                })
                .catch((error) => {});
        };

        const buildingHourlyData = async () => {
            setIsAvgConsumptionDataLoading(true);
            let payload = apiRequestBody(startDate, endDate, time_zone);
            await fetchBuilidingHourly(bldgId, payload)
                .then((res) => {
                    let response = res?.data;
                    let weekDaysResData = response[0]?.weekdays;
                    let weekEndResData = response[0]?.weekend;

                    let weekEndList = [];
                    let weekDaysList = [];

                    const weekDaysData = weekDaysResData.map((el) => {
                        weekDaysList.push(parseFloat(el.y / 1000).toFixed(2));
                        return {
                            x: parseInt(moment.utc(el.x).format('HH')),
                            y: (el.y / 1000).toFixed(2),
                        };
                    });

                    const weekendsData = weekEndResData.map((el) => {
                        weekEndList.push(parseFloat(el.y / 1000).toFixed(2));
                        return {
                            x: parseInt(moment.utc(el.x).format('HH')),
                            y: (el.y / 1000).toFixed(2),
                        };
                    });

                    let finalList = weekEndList.concat(weekDaysList);

                    finalList.sort((a, b) => a - b);

                    let minVal = finalList[0];
                    let maxVal = finalList[finalList.length - 1];

                    if (minVal === maxVal) {
                        minVal = 0;
                    }

                    let heatMapData = [];

                    let newWeekdaysData = {
                        name: 'Week days',
                        data: [],
                    };

                    let newWeekendsData = {
                        name: 'Weekends',
                        data: [],
                    };

                    for (let i = 0; i < 24; i++) {
                        let matchedRecord = weekDaysData.find((record) => record.x === i);

                        if (matchedRecord) {
                            matchedRecord.z = matchedRecord.y;
                            matchedRecord.y = getAverageValue(matchedRecord.y, minVal, maxVal);
                            newWeekdaysData.data.push(matchedRecord);
                        } else {
                            newWeekdaysData.data.push({
                                x: i,
                                y: 0,
                                z: 0,
                            });
                        }
                    }

                    for (let i = 0; i < 24; i++) {
                        let matchedRecord = weekendsData.find((record) => record.x === i);

                        if (matchedRecord) {
                            matchedRecord.z = matchedRecord.y;
                            matchedRecord.y = getAverageValue(matchedRecord.y, minVal, maxVal);
                            newWeekendsData.data.push(matchedRecord);
                        } else {
                            newWeekendsData.data.push({
                                x: i,
                                y: 0,
                                z: 0,
                            });
                        }
                    }
                    for (let i = 0; i < 24; i++) {
                        if (i === 0) {
                            newWeekdaysData.data[i].x = '12AM';
                            newWeekendsData.data[i].x = '12AM';
                        } else if (i === 12) {
                            newWeekdaysData.data[i].x = '12PM';
                            newWeekendsData.data[i].x = '12PM';
                        } else if (i > 12) {
                            let a = i % 12;
                            newWeekdaysData.data[i].x = a + 'PM';
                            newWeekendsData.data[i].x = a + 'PM';
                        } else {
                            newWeekdaysData.data[i].x = i + 'AM';
                            newWeekendsData.data[i].x = i + 'AM';
                        }
                    }

                    heatMapData.push(newWeekendsData);
                    heatMapData.push(newWeekdaysData);

                    setHourlyAvgConsumpData(heatMapData.reverse());
                    setIsAvgConsumptionDataLoading(false);
                })
                .catch((error) => {
                    setIsAvgConsumptionDataLoading(false);
                });
        };

        const buildingConsumptionChart = async () => {
            setIsEnergyConsumptionDataLoading(true);
            let payload = apiRequestBody(startDate, endDate, time_zone);
            await fetchEnergyConsumption(bldgId, payload)
                .then((res) => {
                    let response = res?.data;
                    let newArray = [
                        {
                            name: 'Energy',
                            data: [],
                        },
                    ];
                    response.forEach((record) => {
                        newArray[0].data.push({
                            x: record?.x,
                            y: (record?.y / 1000).toFixed(2),
                        });
                    });
                    setBuildingConsumptionChartData(newArray);
                    setIsEnergyConsumptionDataLoading(false);
                })
                .catch((error) => {
                    setIsEnergyConsumptionDataLoading(false);
                });
        };

        buildingOverallData();
        buildingEndUserData();
        builidingEquipmentsData();
        buildingHourlyData();
        buildingConsumptionChart();
    }, [startDate, endDate, bldgId]);

    useEffect(() => {
        if (bldgId && buildingListData.length !== 0) {
            const bldgObj = buildingListData.find((el) => el?.building_id === bldgId);
            if (bldgObj?.building_id) setIsPlugOnly(bldgObj?.plug_only);
        }
    }, [buildingListData, bldgId]);

    useEffect(() => {
        pageDefaultState();
    }, []);

    return (
        <React.Fragment>
            <Header title="Building Overview" type="page" />

            <div className="mt-4 mb-4">
                <BuildingKPIs daysCount={startEndDayCount} overalldata={overallBldgData} />
            </div>

            <div className="bldg-page-grid-style">
                <div>
                    {!isPlugOnly && (
                        <EnergyConsumptionByEndUse
                            title="Energy Consumption by End Use"
                            subtitle="Energy Totals"
                            energyConsumption={energyConsumption}
                            bldgId={bldgId}
                            pageType="building"
                            handleRouteChange={() => handleRouteChange('/energy/end-uses')}
                            showRouteBtn={true}
                        />
                    )}

                    {isPlugOnly ? (
                        <>
                            <TotalEnergyConsumption
                                title="Total Energy Consumption"
                                subtitle="Hourly Energy Consumption (kWh)"
                                series={buildingConsumptionChartData}
                                isConsumpHistoryLoading={isEnergyConsumptionDataLoading}
                                startEndDayCount={startEndDayCount}
                                timeZone={timeZone}
                                pageType="building"
                                className="mt-4"
                                handleRouteChange={() => handleRouteChange('/energy/end-uses')}
                                showRouteBtn={true}
                            />

                            <HourlyAvgConsumption
                                title="Hourly Average Consumption"
                                subtitle="Average by Hour (kWh)"
                                isAvgConsumptionDataLoading={isAvgConsumptionDataLoading}
                                startEndDayCount={startEndDayCount}
                                series={hourlyAvgConsumpData}
                                height={heatMapChartHeight}
                                timeZone={timeZone}
                                className="mt-4"
                                pageType="building"
                                handleRouteChange={() => handleRouteChange('/energy/time-of-day')}
                                showRouteBtn={true}
                            />
                        </>
                    ) : (
                        <>
                            <HourlyAvgConsumption
                                title="Hourly Average Consumption"
                                subtitle="Average by Hour (kWh)"
                                isAvgConsumptionDataLoading={isAvgConsumptionDataLoading}
                                startEndDayCount={startEndDayCount}
                                series={hourlyAvgConsumpData}
                                height={heatMapChartHeight}
                                timeZone={timeZone}
                                className="mt-4"
                                pageType="building"
                                handleRouteChange={() => handleRouteChange('/energy/time-of-day')}
                                showRouteBtn={true}
                            />
                            <TotalEnergyConsumption
                                title="Total Energy Consumption"
                                subtitle="Hourly Energy Consumption (kWh)"
                                series={buildingConsumptionChartData}
                                isConsumpHistoryLoading={isEnergyConsumptionDataLoading}
                                startEndDayCount={startEndDayCount}
                                timeZone={timeZone}
                                pageType="building"
                                className="mt-4"
                                handleRouteChange={() => handleRouteChange('/energy/end-uses')}
                                showRouteBtn={true}
                            />
                        </>
                    )}
                </div>

                <TopConsumptionWidget
                    title="Top Energy Consumers"
                    heads={['Equipment', 'Energy', 'Change']}
                    rows={topEnergyConsumptionData}
                    className={'fit-container-style'}
                    handleClick={handleClick}
                    widgetType="TopEnergyConsumersWidget"
                />
            </div>

            <div>
                <EquipChartModal
                    showEquipmentChart={showEquipmentChart}
                    handleChartClose={handleChartClose}
                    equipmentFilter={equipmentFilter}
                    fetchEquipmentData={builidingEquipmentsData}
                    selectedTab={selectedModalTab}
                    setSelectedTab={setSelectedModalTab}
                    activePage="buildingOverview"
                />
            </div>
        </React.Fragment>
    );
};

export default BuildingOverview;
