import React, { useState, useEffect } from 'react';
import { FormGroup } from 'reactstrap';
import Form from 'react-bootstrap/Form';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass, faChartMixed } from '@fortawesome/pro-regular-svg-icons';
import DeviceChartModel from '../DeviceChartModel';
import { Link, useParams, useHistory } from 'react-router-dom';
import axios from 'axios';
import {
    BaseUrl,
    generalPassiveDevices,
    getLocation,
    sensorGraphData,
    listSensor,
    updateActivePassiveDevice,
} from '../../../services/Network';
import { percentageHandler, convert24hourTo12HourFormat, dateFormatHandler } from '../../../utils/helper';
import { BuildingStore } from '../../../store/BuildingStore';
import { BreadcrumbStore } from '../../../store/BreadcrumbStore';
import { ComponentStore } from '../../../store/ComponentStore';
import Modal from 'react-bootstrap/Modal';
import { Button, Input } from 'reactstrap';
import { Cookies } from 'react-cookie';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import './style.css';

const SelectBreakerModel = ({
    showBreaker,
    handleBreakerClose,
    breakers,
    panels,
    currentRecord,
    setCurrentRecord,
    sensors,
    setSensors,
    currentIndex,
    setCurrentIndex,
}) => {
    const saveToSensorArray = () => {
        let currentArray = sensors;
        currentArray[currentIndex] = currentRecord;
        setSensors(currentArray);
    };

    const handleSensorChange = (key, value) => {
        let obj = Object.assign({}, currentRecord);
        obj[key] = value;
        setCurrentRecord(obj);
    };

    return (
        <>
            <Modal show={showBreaker} onHide={handleBreakerClose} size={'md'} centered>
                <Modal.Header>
                    <Modal.Title>Select Breaker</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                            <Form.Label>Panel</Form.Label>
                            <Input
                                type="select"
                                name="select"
                                id="exampleSelect"
                                className="font-weight-bold"
                                defaultValue={currentRecord.panel_name}
                                onChange={(e) => {
                                    handleSensorChange('panel_name', e.target.value);
                                }}>
                                <option selected>Select Panel</option>
                                {panels.map((record) => {
                                    return <option value={record.panel_id}>{record.panel_name}</option>;
                                })}
                            </Input>
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                            <Form.Label>Breaker</Form.Label>
                            <Input
                                type="select"
                                name="select"
                                id="exampleSelect"
                                className="font-weight-bold"
                                defaultValue={currentRecord.breaker_name}
                                onChange={(e) => {
                                    handleSensorChange('breaker_name', e.target.value);
                                }}>
                                <option selected>Select Breaker</option>
                                {breakers.map((record) => {
                                    return <option value={record.breaker_id}>{record.breaker_name}</option>;
                                })}
                            </Input>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="light" onClick={handleBreakerClose}>
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={() => {
                            handleBreakerClose();
                            saveToSensorArray();
                        }}>
                        Save
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

const IndividualPassiveDevice = () => {
    let cookies = new Cookies();
    let userdata = cookies.get('user');

    let history = useHistory();

    const { deviceId } = useParams();
    console.log(deviceId);
    const [sensorId, setSensorId] = useState('');
    // Chart states
    const [showChart, setShowChart] = useState(false);
    const handleChartClose = () => setShowChart(false);

    // Select Breaker states
    const [showBreaker, setShowBreaker] = useState(false);
    const handleBreakerClose = () => setShowBreaker(false);
    const handleBreakerShow = () => setShowBreaker(true);

    const [isProcessing, setIsProcessing] = useState(false);
    const [selectedTab, setSelectedTab] = useState(0);

    const [sensorCount, setSensorCount] = useState(0);

    const [passiveData, setPassiveData] = useState({});
    const [onlineDeviceData, setOnlineDeviceData] = useState([]);
    const [offlineDeviceData, setOfflineDeviceData] = useState([]);
    const [locationData, setLocationData] = useState([]);
    const [createDeviceData, setCreateDeviceData] = useState({
        device_type: 'passive',
    });
    const bldgId = BuildingStore.useState((s) => s.BldgId);
    const [currentRecord, setCurrentRecord] = useState({});
    const [currentIndex, setCurrentIndex] = useState(0);
    const [sensors, setSensors] = useState([]);
    const [sensorData, setSensordata] = useState([]);

    const [isLocationFetched, setIsLocationFetched] = useState(true);
    const [activeLocationId, setActiveLocationId] = useState('');
    const [sensorAPIRefresh, setSensorAPIRefresh] = useState(false);
    const [isFetchingSensorData, setIsFetchingSensorData] = useState(true);

    const [breakers, setBreakers] = useState([
        {
            breaker_name: 'Breaker 1',
            breaker_id: 'Breaker 1',
        },
        {
            breaker_name: 'Breaker 2',
            breaker_id: 'Breaker 2',
        },
        {
            breaker_name: 'Breaker 3',
            breaker_id: 'Breaker 3',
        },
    ]);

    const [panels, setPanels] = useState([
        {
            panel_name: 'Panel 1',
            panel_id: 'Panel 1',
        },
        {
            panel_name: 'Panel 2',
            panel_id: 'Panel 2',
        },
        {
            panel_name: 'Panel 3',
            panel_id: 'Panel 3',
        },
    ]);

    const handleChartShow = (id) => {
        setSensorId(id);
        setShowChart(true);
        let obj = sensors.find((o) => o.id === id);
        setSensordata(obj);
        fetchSensorGraphData(id);
    };
    console.log('panel', panels);

    useEffect(() => {
        const fetchSinglePassiveDevice = async () => {
            try {
                let headers = {
                    'Content-Type': 'application/json',
                    accept: 'application/json',
                    Authorization: `Bearer ${userdata.token}`,
                };
                let params = `?device_id=${deviceId}&page_size=100&page_no=1&building_id=${bldgId}`;
                await axios.get(`${BaseUrl}${generalPassiveDevices}${params}`, { headers }).then((res) => {
                    let response = res.data.data[0];
                    setPassiveData(response);
                    setActiveLocationId(response.location_id);
                });
            } catch (error) {
                console.log(error);
                console.log('Failed to fetch Passive device data');
            }
        };

        const fetchActiveDeviceSensorData = async () => {
            try {
                setIsFetchingSensorData(true);
                let headers = {
                    'Content-Type': 'application/json',
                    accept: 'application/json',
                    Authorization: `Bearer ${userdata.token}`,
                };
                let params = `?device_id=${deviceId}`;
                await axios.get(`${BaseUrl}${listSensor}${params}`, { headers }).then((res) => {
                    let response = res.data;
                    setSensors(response);
                });
                setIsFetchingSensorData(false);
            } catch (error) {
                console.log(error);
                setIsFetchingSensorData(false);
                console.log('Failed to fetch Active device sensor data');
            }
        };

        const fetchLocationData = async () => {
            try {
                setIsLocationFetched(true);
                let headers = {
                    'Content-Type': 'application/json',
                    accept: 'application/json',
                    Authorization: `Bearer ${userdata.token}`,
                };
                await axios.get(`${BaseUrl}${getLocation}/${bldgId}`, { headers }).then((res) => {
                    setLocationData(res.data);
                });
                setIsLocationFetched(false);
            } catch (error) {
                console.log(error);
                setIsLocationFetched(false);
                console.log('Failed to fetch Location Data');
            }
        };

        fetchSinglePassiveDevice();
        fetchActiveDeviceSensorData();
        fetchLocationData();
    }, [deviceId]);

    useEffect(() => {
        const updateBreadcrumbStore = () => {
            BreadcrumbStore.update((bs) => {
                let newList = [
                    {
                        label: 'Passive Devices',
                        path: '/settings/passive-devices',
                        active: true,
                    },
                ];
                bs.items = newList;
            });
            ComponentStore.update((s) => {
                s.parent = 'building-settings';
            });
        };
        updateBreadcrumbStore();
    }, []);

    const fetchSensorGraphData = async (id) => {
        try {
            let endDate = new Date(); // today
            let startDate = new Date();
            startDate.setDate(startDate.getDate() - 7);

            let headers = {
                'Content-Type': 'application/json',
                accept: 'application/json',
                Authorization: `Bearer ${userdata.token}`,
            };
            let params = `?sensor_id=${id === sensorId ? sensorId : id}`;
            await axios
                .post(
                    `${BaseUrl}${sensorGraphData}${params}`,
                    {
                        date_from: dateFormatHandler(startDate),
                        date_to: dateFormatHandler(endDate),
                    },
                    { headers }
                )
                .then((res) => {
                    let response = res.data;
                    console.log('Sensor Graph Data => ', response);
                });
        } catch (error) {
            console.log(error);
            console.log('Failed to fetch Sensor Graph data');
        }
    };

    const updateActiveDeviceData = async () => {
        if (passiveData.equipments_id) {
            try {
                let headers = {
                    'Content-Type': 'application/json',
                    accept: 'application/json',
                    Authorization: `Bearer ${userdata.token}`,
                };
                let params = `?device_id=${passiveData.equipments_id}`;
                await axios
                    .post(
                        `${BaseUrl}${updateActivePassiveDevice}${params}`,
                        {
                            location_id: activeLocationId,
                        },
                        { headers }
                    )
                    .then((res) => {
                        setSensorAPIRefresh(!sensorAPIRefresh);
                        console.log(res.data);
                    });
            } catch (error) {
                console.log(error);
                console.log('Failed to link Sensor with Equipment');
            }
        }
    };

    return (
        <>
            <div>
                <div>
                    <div className="single-passive-container">
                        <div className="passive-page-header">
                            <div>
                                <div className="mb-1">
                                    <span className="passive-device-style">Passive Device</span>
                                </div>
                                <div>
                                    <span className="passive-device-name mr-3">{passiveData.identifier}</span>
                                    <span className="passive-sensor-count">{sensors.length} Sensors</span>
                                </div>
                            </div>
                            <div>
                                <Link to="/settings/passive-devices">
                                    <button type="button" className="btn btn-default passive-cancel-style">
                                        Cancel
                                    </button>
                                </Link>
                                <button
                                    type="button"
                                    className="btn btn-primary passive-save-style ml-2"
                                    onClick={() => {
                                        updateActiveDeviceData();
                                        history.push('/settings/active-devices');
                                    }}
                                    disabled={
                                        activeLocationId === 'Select location' ||
                                        activeLocationId === passiveData.location_id
                                            ? true
                                            : false
                                    }>
                                    Save
                                </button>
                            </div>
                        </div>
                        <div className="mt-2 single-passive-tabs-style">
                            <span className="mr-3 single-passive-tab-active">Configure</span>
                            <span className="mr-3 single-passive-tab">History</span>
                        </div>
                    </div>
                </div>

                <div className="container">
                    <div className="row">
                        <div className="col-4">
                            <h5 className="device-title">Device Details</h5>
                            <div className="mt-2">
                                <div>
                                    <Form.Group className="mb-1" controlId="exampleForm.ControlInput1">
                                        <Form.Label className="device-label-style">Installed Location</Form.Label>

                                        {isLocationFetched ? (
                                            <Skeleton count={1} height={35} />
                                        ) : (
                                            <Input
                                                type="select"
                                                name="select"
                                                id="exampleSelect"
                                                className="font-weight-bold"
                                                onChange={(e) => {
                                                    setActiveLocationId(e.target.value);
                                                }}
                                                value={activeLocationId}>
                                                <option>Select Location</option>
                                                {locationData.map((record, index) => {
                                                    return (
                                                        <option value={record.location_id}>
                                                            {record.location_name}
                                                        </option>
                                                    );
                                                })}
                                            </Input>
                                        )}

                                        <Form.Label className="device-sub-label-style mt-1">
                                            Location this device is installed in.
                                        </Form.Label>
                                    </Form.Group>
                                </div>
                                <div className="single-passive-grid">
                                    <div>
                                        <h6 className="device-label-style" htmlFor="customSwitches">
                                            Identifier
                                        </h6>
                                        <h6 className="passive-device-value">{passiveData.identifier}</h6>
                                    </div>
                                    <div>
                                        <h6 className="device-label-style" htmlFor="customSwitches">
                                            Device Model
                                        </h6>
                                        <h6 className="passive-device-value">{passiveData.model}</h6>
                                    </div>
                                </div>
                                <div className="single-passive-grid">
                                    <div>
                                        <h6 className="device-label-style" htmlFor="customSwitches">
                                            Firmware Version
                                        </h6>
                                        <h6 className="passive-device-value">v1.2</h6>
                                    </div>
                                    <div>
                                        <h6 className="device-label-style" htmlFor="customSwitches">
                                            Device Version
                                        </h6>
                                        <h6 className="passive-device-value">v2</h6>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-8">
                            <h5 className="device-title">Sensors ({sensors.length})</h5>
                            <div className="mt-2">
                                <div className="active-sensor-header">
                                    <div className="search-container mr-2">
                                        <FontAwesomeIcon icon={faMagnifyingGlass} size="md" />
                                        <input
                                            className="search-box ml-2"
                                            type="search"
                                            name="search"
                                            placeholder="Search..."
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* <div className="mt-2 socket-image-container"></div> */}

                            {isFetchingSensorData ? (
                                <div className="mt-4">
                                    <Skeleton count={8} height={40} />
                                </div>
                            ) : (
                                <>
                                    {sensors.map((record, index) => {
                                        return (
                                            <>
                                                {record.equipment_id === '' ? (
                                                    <div className="sensor-container-style-notAttached mt-3">
                                                        <div className="sensor-data-style">
                                                            <span className="sensor-data-no">{index + 1}</span>
                                                            <span className="sensor-data-title">No Attached</span>
                                                        </div>
                                                        <div className="sensor-data-style-right">
                                                            <button
                                                                type="button"
                                                                className="btn btn-default passive-edit-style">
                                                                {/* onClick={() => {
                                                            handleBreakerShow();
                                                            setCurrentRecord(record);
                                                            setCurrentIndex(index);
                                                        }}> */}
                                                                Edit
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="sensor-container-style mt-3">
                                                        <div className="sensor-data-style">
                                                            <span className="sensor-data-no">{index + 1}</span>
                                                            <span className="sensor-data-title">
                                                                {record.breaker_link}
                                                            </span>
                                                            <span className="sensor-data-device">
                                                                {record.equipment}
                                                            </span>
                                                        </div>
                                                        <div className="sensor-data-style-right">
                                                            <FontAwesomeIcon
                                                                icon={faChartMixed}
                                                                size="md"
                                                                onClick={() => {
                                                                    handleChartShow(record.id);
                                                                }}
                                                            />
                                                            <button
                                                                type="button"
                                                                className="btn btn-default passive-edit-style">
                                                                {/* // onClick={() => {
                                                        //     handleBreakerShow();
                                                        //     setCurrentRecord(record);
                                                        //     setCurrentIndex(index);
                                                        // }}> */}
                                                                Edit
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                        );
                                    })}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* <DeviceChartModel showChart={showChart} handleChartClose={handleChartClose} sensorData={sensorData} /> */}

            <SelectBreakerModel
                showBreaker={showBreaker}
                handleBreakerClose={handleBreakerClose}
                breakers={breakers}
                panels={panels}
                sensors={sensors}
                setSensors={setSensors}
                currentRecord={currentRecord}
                setCurrentRecord={setCurrentRecord}
                currentIndex={currentIndex}
            />
        </>
    );
};

export default IndividualPassiveDevice;
