import React, { useState, useEffect } from 'react';
import { Row, Col } from 'reactstrap';
import DeviceChartModel from '../../../pages/chartModal/DeviceChartModel';
import { useParams, useHistory } from 'react-router-dom';
import moment from 'moment';
import { BuildingStore } from '../../../store/BuildingStore';
import { BreadcrumbStore } from '../../../store/BreadcrumbStore';
import { ComponentStore } from '../../../store/ComponentStore';
import { buildingData, userPermissionData } from '../../../store/globalState';
import Skeleton from 'react-loading-skeleton';
import AddSensorPanelModel from './AddSensorPanelModel';
import { DateRangeStore } from '../../../store/DateRangeStore';
import './style.css';
import { useAtom } from 'jotai';
import { handleAPIRequestBody } from '../../../helpers/helpers';
import DeleteDevice from './DeleteDevice';
import Brick from '../../../sharedComponents/brick';
import { ReactComponent as PenSVG } from '../../../assets/icon/panels/pen.svg';
import { ReactComponent as SearchSVG } from '../../../assets/icon/search.svg';
import './styles.scss';
import Typography from '../../../sharedComponents/typography';
import EditPassiveDevice from './EditPassiveDevice';
import {
    getLocationData,
    getPassiveDeviceSensors,
    getSensorGraphData,
    getSinglePassiveDevice,
    updatePassiveDevice,
} from './services';
import { Button } from '../../../sharedComponents/button';
import Select from '../../../sharedComponents/form/select';
import { UserStore } from '../../../store/UserStore';
import '../active-devices/styles.scss';
import '../../../sharedComponents/breaker/Breaker.scss';
import { updateBuildingStore } from '../../../helpers/updateBuildingStore';
import Sensors from './Sensors';
import colorPalette from '../../../assets/scss/_colors.scss';
import { defaultDropdownSearch } from '../../../sharedComponents/form/select/helpers';

const IndividualPassiveDevice = () => {
    const [userPermission] = useAtom(userPermissionData);
    const isUserAdmin = userPermission?.is_admin ?? false;
    const isSuperUser = userPermission?.is_superuser ?? false;
    const isSuperAdmin = isUserAdmin || isSuperUser;
    const canUserEdit = userPermission?.permissions?.permissions?.advanced_passive_device_permission?.edit ?? false;
    const canUserDelete = userPermission?.permissions?.permissions?.advanced_passive_device_permission?.delete ?? false;

    const startDate = DateRangeStore.useState((s) => s.startDate);
    const endDate = DateRangeStore.useState((s) => s.endDate);
    const startTime = DateRangeStore.useState((s) => s.startTime);
    const endTime = DateRangeStore.useState((s) => s.endTime);
    const daysCount = DateRangeStore.useState((s) => +s.daysCount);

    let history = useHistory();

    const { deviceId } = useParams();
    const { bldgId } = useParams();
    const [buildingListData] = useAtom(buildingData);
    const [sensorId, setSensorId] = useState('');

    // Chart states
    const [showChart, setShowChart] = useState(false);
    const handleChartClose = () => setShowChart(false);

    // Select Breaker states
    const [showBreaker, setShowBreaker] = useState(false);
    const handleBreakerClose = () => setShowBreaker(false);
    const handleBreakerShow = () => setShowBreaker(true);

    // Delete Smart Meter Modal
    const [showDeleteModal, setShowDelete] = useState(false);
    const closeDeleteAlert = () => setShowDelete(false);
    const showDeleteAlert = () => setShowDelete(true);

    // Edit Device Modal states
    const [isEditDeviceModalOpen, setEditDeviceDeviceModal] = useState(false);
    const closeEditDeviceModal = () => setEditDeviceDeviceModal(false);
    const openEditDeviceModal = () => setEditDeviceDeviceModal(true);

    const [passiveData, setPassiveData] = useState({});
    const [locationData, setLocationData] = useState([]);
    const [selectedPassiveDevice, setSelectedPassiveDevice] = useState({});

    const timeZone = BuildingStore.useState((s) => s.BldgTimeZone);
    const [sensorObj, setSensorObj] = useState({});
    const [currentSensorObj, setCurrentSensorObj] = useState(null);
    const [editSenorModelRefresh, setEditSenorModelRefresh] = useState(false);
    const [breakerId, setBreakerId] = useState('');
    const [sensors, setSensors] = useState([]);
    const [sensorData, setSensorData] = useState([]);

    const [isLocationFetched, setIsLocationFetched] = useState(true);
    const [activeLocationId, setActiveLocationId] = useState('');
    const [sensorAPIRefresh, setSensorAPIRefresh] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isFetchingSensorData, setIsFetchingSensorData] = useState(true);
    const [locationError, setLocationError] = useState(null);

    const [seriesData, setSeriesData] = useState([]);
    const [deviceData, setDeviceData] = useState([]);

    const [isSensorChartLoading, setIsSensorChartLoading] = useState(true);
    const CONVERSION_ALLOWED_UNITS = ['power'];

    const UNIT_DIVIDER = 1000;

    const [metric, setMetric] = useState([
        { value: 'minCurrentMilliAmps', label: 'Minimum Current (mA)', unit: 'mA', Consumption: 'Minimum Current' },
        { value: 'maxCurrentMilliAmps', label: 'Maximum Current (mA)', unit: 'mA', Consumption: 'Maximum Current' },
        { value: 'rmsCurrentMilliAmps', label: 'RMS Current (mA)', unit: 'mA', Consumption: 'RMS Current' },
        { value: 'power', label: 'Power (W)', unit: 'W', Consumption: 'Power' },
    ]);

    const [selectedConsumption, setConsumption] = useState(metric[2].value);
    const [selectedUnit, setSelectedUnit] = useState(metric[2].unit);
    const [searchSensor, setSearchSensor] = useState('');
    const [selectedConsumptionLabel, setSelectedConsumptionLabel] = useState(metric[2].Consumption);

    const handleSearchChange = (e) => {
        setSearchSensor(e.target.value);
    };

    const filtered = !searchSensor
        ? sensors
        : sensors.filter((sensor) => {
              return (
                  sensor.name.toLowerCase().includes(searchSensor.toLowerCase()) ||
                  sensor.breaker_link.toLowerCase().includes(searchSensor.toLowerCase()) ||
                  sensor.equipment.toLowerCase().includes(searchSensor.toLowerCase())
              );
          });

    const handleChartShow = (id) => {
        setSensorId(id);
        let obj = sensors.find((o) => o.id === id);
        setSensorData(obj);
        fetchSensorGraphData(id);
        setShowChart(true);
    };

    const getRequiredConsumptionLabel = (value) => {
        let label = '';

        metric.map((m) => {
            if (m.value === value) {
                label = m.label;
            }

            return m;
        });

        return label;
    };

    const fetchSensorGraphData = async (id) => {
        setIsSensorChartLoading(true);

        let params = `?sensor_id=${
            id === sensorId ? sensorId : id
        }&consumption=rmsCurrentMilliAmps&building_id=${bldgId}`;

        const payload = handleAPIRequestBody(startDate, endDate, timeZone, startTime, endTime);

        await getSensorGraphData(params, payload)
            .then((res) => {
                setDeviceData([]);
                setSeriesData([]);
                let response = res.data;
                let data = response;
                let exploreData = [];
                let NulledData = [];
                data.map((ele) => {
                    if (ele?.consumption === '') {
                        NulledData.push({ x: moment.utc(new Date(ele?.time_stamp)), y: null });
                    } else {
                        if (CONVERSION_ALLOWED_UNITS.indexOf(selectedConsumption) > -1) {
                            NulledData.push({
                                x: moment.utc(new Date(ele?.time_stamp)),
                                y: ele?.consumption / UNIT_DIVIDER,
                            });
                        } else {
                            NulledData.push({ x: new Date(ele?.time_stamp).getTime(), y: ele?.consumption });
                        }
                    }
                });
                let recordToInsert = {
                    data: NulledData,
                    name: getRequiredConsumptionLabel(selectedConsumption),
                };
                setDeviceData([recordToInsert]);
                setIsSensorChartLoading(false);
            })
            .catch(() => {
                setIsSensorChartLoading(false);
            });
    };

    const updatePassiveDeviceData = async () => {
        if (activeLocationId === passiveData?.location_id) {
            setLocationError({
                text: 'Please update Location.',
            });
            return;
        }
        if (!passiveData?.equipments_id) return;
        setIsProcessing(true);
        const params = `?device_id=${passiveData?.equipments_id}`;
        const payload = {
            location_id: activeLocationId,
        };

        await updatePassiveDevice(params, payload)
            .then((res) => {
                const response = res?.data;
                setSensorAPIRefresh(!sensorAPIRefresh);
                setIsProcessing(false);
                fetchPassiveDevice();
                if (response?.success) {
                    UserStore.update((s) => {
                        s.showNotification = true;
                        s.notificationMessage = 'Device updated Successfully.';
                        s.notificationType = 'success';
                    });
                } else {
                    UserStore.update((s) => {
                        s.showNotification = true;
                        s.notificationMessage = response?.message
                            ? response?.message
                            : res
                            ? 'Unable to update Smart Meter.'
                            : 'Unable to update Smart Meter due to Internal Server Error!.';
                        s.notificationType = 'error';
                    });
                }
                setLocationError(null);
            })
            .catch(() => {
                setIsProcessing(false);
                setLocationError(null);
            });
    };

    const redirectToPassivePage = () => {
        history.push({ pathname: `/settings/smart-meters/${bldgId}` });
    };

    const fetchPassiveDevice = async () => {
        let params = `?device_id=${deviceId}&page_size=100&page_no=1&building_id=${bldgId}`;
        await getSinglePassiveDevice(params)
            .then((res) => {
                let response = res?.data?.data[0];
                setPassiveData(response);
                setActiveLocationId(response?.location_id);
                localStorage.setItem('identifier', response.identifier);
            })
            .catch(() => {});
    };

    const fetchPassiveDeviceSensorData = async () => {
        setIsFetchingSensorData(true);
        const params = `?device_id=${deviceId}`;
        await getPassiveDeviceSensors(params)
            .then((res) => {
                const response = res?.data;
                setSensors(response);
                setIsFetchingSensorData(false);
            })
            .catch(() => {
                setIsFetchingSensorData(false);
            });
    };

    const fetchLocationData = async () => {
        setIsLocationFetched(true);
        await getLocationData(`/${bldgId}`)
            .then((res) => {
                let response = res?.data;
                response.sort((a, b) => {
                    return a.location_name.localeCompare(b.location_name);
                });
                let locationList = [];
                response.forEach((el) => {
                    let obj = {
                        label: el?.location_name,
                        value: el?.location_id,
                    };
                    locationList.push(obj);
                });
                setLocationData(locationList);
                setIsLocationFetched(false);
            })
            .catch(() => {
                setIsLocationFetched(false);
            });
    };

    const updateBreadcrumbStore = () => {
        BreadcrumbStore.update((bs) => {
            let newList = [
                {
                    label: 'Smart Meters',
                    path: `/settings/smart-meters/${bldgId}`,
                    active: false,
                },
            ];
            bs.items = newList;
        });
        ComponentStore.update((s) => {
            s.parent = 'building-settings';
        });
    };

    useEffect(() => {
        fetchPassiveDevice();
        fetchPassiveDeviceSensorData();
        fetchLocationData();
    }, [deviceId]);

    useEffect(() => {
        BreadcrumbStore.update((bs) => {
            let newList = [
                {
                    label: 'Smart Meters',
                    path: `/settings/smart-meters/${bldgId}`,
                    active: false,
                },
                {
                    label: passiveData?.identifier,
                    path: '/settings/smart-meters/single',
                    active: true,
                },
            ];
            bs.items = newList;
        });
        if (passiveData) setSelectedPassiveDevice(passiveData);
    }, [passiveData]);

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
        updateBreadcrumbStore();
    }, []);

    return (
        <React.Fragment>
            <Row>
                <Col lg={12}>
                    <div className="passive-header-wrapper d-flex justify-content-between">
                        <div className="d-flex flex-column justify-content-between">
                            <Typography.Subheader size={Typography.Sizes.sm} className="font-weight-bold">
                                Smart Meter
                            </Typography.Subheader>
                            <div className="d-flex align-items-center">
                                <Typography.Header size={Typography.Sizes.md} className="mr-2">
                                    {passiveData?.identifier}
                                </Typography.Header>
                                <Typography.Subheader
                                    size={Typography.Sizes.md}
                                    className="d-flex align-items-center mt-1">
                                    {`${sensors.length} Sensors`}
                                </Typography.Subheader>
                            </div>
                            <Typography.Subheader
                                size={Typography.Sizes.md}
                                className="mouse-pointer typography-wrapper active-tab-style">
                                Configure
                            </Typography.Subheader>
                        </div>
                        <div className="d-flex">
                            <div>
                                <Button
                                    label="Cancel"
                                    size={Button.Sizes.md}
                                    type={Button.Type.secondaryGrey}
                                    onClick={redirectToPassivePage}
                                />
                            </div>
                            <div>
                                {isSuperAdmin || canUserEdit ? (
                                    <Button
                                        label={isProcessing ? 'Saving' : 'Save'}
                                        size={Button.Sizes.md}
                                        type={Button.Type.primary}
                                        onClick={updatePassiveDeviceData}
                                        className="ml-2"
                                        disabled={isProcessing || activeLocationId === passiveData?.location_id}
                                    />
                                ) : null}
                            </div>
                        </div>
                    </div>
                </Col>
            </Row>

            <Row className="passive-container">
                <Col lg={4}>
                    <Typography.Subheader size={Typography.Sizes.md}>Device Details</Typography.Subheader>

                    <Brick sizeInRem={1.5} />

                    <div>
                        <Typography.Subheader size={Typography.Sizes.sm}>Installed Location</Typography.Subheader>
                        <Brick sizeInRem={0.25} />
                        {isLocationFetched || isProcessing ? (
                            <Skeleton
                                baseColor={colorPalette.primaryGray150}
                                highlightColor={colorPalette.baseBackground}
                                count={1}
                                height={35}
                            />
                        ) : (
                            <Select
                                placeholder="Select Location"
                                options={locationData}
                                currentValue={locationData.filter((option) => option.value === activeLocationId)}
                                onChange={(e) => {
                                    setActiveLocationId(e.value);
                                    setLocationError(null);
                                }}
                                isSearchable={true}
                                customSearchCallback={({ data, query }) => defaultDropdownSearch(data, query?.value)}
                                disabled={!(isSuperAdmin || canUserEdit)}
                                error={locationError}
                            />
                        )}
                        <Brick sizeInRem={0.25} />
                        {!locationError && (
                            <Typography.Body size={Typography.Sizes.sm}>
                                Location this device is installed.
                            </Typography.Body>
                        )}
                    </div>

                    <Brick sizeInRem={1.5} />

                    <div className="device-container">
                        <div>
                            <div>
                                <Typography.Subheader size={Typography.Sizes.sm}>Identifier</Typography.Subheader>
                                <Brick sizeInRem={0.25} />
                                <Typography.Subheader size={Typography.Sizes.md}>
                                    {passiveData?.identifier}
                                </Typography.Subheader>
                            </div>
                            <Brick sizeInRem={1} />
                            <div>
                                <Typography.Subheader size={Typography.Sizes.sm}>Firmware Version</Typography.Subheader>
                                <Brick sizeInRem={0.25} />
                                <Typography.Subheader size={Typography.Sizes.md}>v1.2</Typography.Subheader>
                            </div>
                        </div>

                        <div>
                            <div>
                                <Typography.Subheader size={Typography.Sizes.sm}>Device Model</Typography.Subheader>
                                <Brick sizeInRem={0.25} />
                                <Typography.Subheader size={Typography.Sizes.md}>
                                    {passiveData?.model &&
                                        passiveData?.model.charAt(0).toUpperCase() + passiveData?.model.slice(1)}
                                </Typography.Subheader>
                            </div>
                            <Brick sizeInRem={1} />
                            <div>
                                <Typography.Subheader size={Typography.Sizes.sm}>Device Version</Typography.Subheader>
                                <Brick sizeInRem={0.25} />
                                <Typography.Subheader size={Typography.Sizes.md}>v2</Typography.Subheader>
                            </div>
                        </div>

                        {isSuperAdmin || canUserEdit ? (
                            <div
                                className="d-flex justify-content-between align-items-start mouse-pointer"
                                onClick={openEditDeviceModal}>
                                <PenSVG className="mr-2" />
                                <Typography.Subheader size={Typography.Sizes.sm}>Edit</Typography.Subheader>
                            </div>
                        ) : null}
                    </div>
                </Col>

                <Col lg={8}>
                    <Typography.Subheader
                        size={Typography.Sizes.md}>{`Sensors (${sensors.length})`}</Typography.Subheader>
                    <Brick sizeInRem={0.5} />
                    <div className="active-sensor-header">
                        <div className="search-container mr-2">
                            <SearchSVG className="mb-1" />
                            <input
                                className="search-box ml-2"
                                type="search"
                                name="search"
                                placeholder="Search"
                                value={searchSensor}
                                onChange={handleSearchChange}
                            />
                        </div>
                    </div>

                    <Brick sizeInRem={0.25} />

                    {isFetchingSensorData ? (
                        <div>
                            <Skeleton
                                baseColor={colorPalette.primaryGray150}
                                highlightColor={colorPalette.baseBackground}
                                count={8}
                                height={40}
                            />
                        </div>
                    ) : (
                        <Sensors
                            data={filtered}
                            userPermission={userPermission}
                            handleChartShow={handleChartShow}
                            fetchPassiveDeviceSensorData={fetchPassiveDeviceSensorData}
                        />
                    )}
                </Col>
            </Row>

            {(isSuperAdmin || canUserDelete) && (
                <div className="passive-container">
                    <DeleteDevice
                        showDeleteModal={showDeleteModal}
                        showDeleteAlert={showDeleteAlert}
                        closeDeleteAlert={closeDeleteAlert}
                        redirectToPassivePage={redirectToPassivePage}
                        selectedPassiveDevice={selectedPassiveDevice}
                    />
                </div>
            )}

            <DeviceChartModel
                showChart={showChart}
                handleChartClose={handleChartClose}
                sensorData={sensorData}
                seriesData={seriesData}
                setSeriesData={setSeriesData}
                deviceData={deviceData}
                setDeviceData={setDeviceData}
                CONVERSION_ALLOWED_UNITS={CONVERSION_ALLOWED_UNITS}
                UNIT_DIVIDER={UNIT_DIVIDER}
                metric={metric}
                setMetric={setMetric}
                selectedConsumption={selectedConsumption}
                setConsumption={setConsumption}
                selectedUnit={selectedUnit}
                setSelectedUnit={setSelectedUnit}
                selectedConsumptionLabel={selectedConsumptionLabel}
                setSelectedConsumptionLabel={setSelectedConsumptionLabel}
                getRequiredConsumptionLabel={getRequiredConsumptionLabel}
                isSensorChartLoading={isSensorChartLoading}
                setIsSensorChartLoading={setIsSensorChartLoading}
                timeZone={timeZone}
                daysCount={daysCount}
                deviceType="passive"
            />

            <AddSensorPanelModel
                showBreaker={showBreaker}
                handleBreakerClose={handleBreakerClose}
                sensorObj={sensorObj}
                bldgId={bldgId}
                breakerId={breakerId}
            />

            <EditPassiveDevice
                isEditDeviceModalOpen={isEditDeviceModalOpen}
                closeEditDeviceModal={closeEditDeviceModal}
                passiveDeviceData={passiveData}
                fetchPassiveDevice={fetchPassiveDevice}
            />
        </React.Fragment>
    );
};

export default IndividualPassiveDevice;
