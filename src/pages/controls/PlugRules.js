import React, { useState, useEffect } from 'react';
import {
    Row,
    Col,
    Card,
    CardBody,
    Table,
    UncontrolledDropdown,
    DropdownMenu,
    DropdownToggle,
    DropdownItem,
    Button,
    Input,
} from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/pro-regular-svg-icons';
import { faPlus } from '@fortawesome/pro-solid-svg-icons';

import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import axios from 'axios';
import { BaseUrl, listPlugRules, createPlugRule, updatePlugRule } from '../../services/Network';
import { ChevronDown } from 'react-feather';
import { BreadcrumbStore } from '../../store/BreadcrumbStore';
import EditPlugRule from './EditPlugRule';
import './style.css';

const PlugRuleTable = ({ plugRuleData, handleEditRuleShow, currentData, setCurrentData, handleCurrentDataChange }) => {
    return (
        <Card>
            <CardBody>
                <Table className="mb-0 bordered table-hover">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Description</th>
                            <th>Days</th>
                            <th>Socket Count</th>
                        </tr>
                    </thead>
                    <tbody>
                        {plugRuleData.map((record, index) => {
                            return (
                                <tr key={index}>
                                    <td
                                        className="font-weight-bold panel-name"
                                        onClick={() => {
                                            setCurrentData(record);
                                            handleEditRuleShow();
                                        }}>
                                        {record.name}
                                    </td>
                                    {/* <td>{record.name}</td> */}
                                    <td className="font-weight-bold">
                                        {record.description === '' ? '-' : record.description}
                                    </td>
                                    <td className="font-weight-bold">{record.days ? record.days : '-'}</td>
                                    <td className="font-weight-bold">{record.socketCount ? record.socketCount : 0}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </Table>
            </CardBody>
        </Card>
    );
};

const PlugRules = () => {
    // Add Rule Model
    const [showAddRule, setShowAddRule] = useState(false);
    const handleAddRuleClose = () => setShowAddRule(false);
    const handleAddRuleShow = () => setShowAddRule(true);

    // Edit Rule Model
    const [showEditRule, setShowEditRule] = useState(false);
    const handleEditRuleClose = () => setShowEditRule(false);
    const handleEditRuleShow = () => setShowEditRule(true);

    const [buildingId, setBuildingId] = useState(1);
    const [ruleData, setRuleData] = useState([
        {
            name: '8am-6pm M-F',
            description: '-',
            days: 'Weekdays',
            socketCount: 15,
        },
        {
            name: 'Workstations 7am-5pm',
            description: '-',
            days: 'Weekdays',
            socketCount: 25,
        },
        {
            name: 'Refrigerators',
            description: '-',
            days: 'All Days',
            socketCount: 25,
        },
        {
            name: '9am-7pm',
            description: '-',
            days: 'Weekdays',
            socketCount: 25,
        },
        {
            name: 'Ice/Water Machines',
            description: '-',
            days: 'Weekdays',
            socketCount: 25,
        },
        {
            name: '8am-9pm M-F',
            description: '-',
            days: 'Weekdays',
            socketCount: 25,
        },
    ]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [pageRefresh, setPageRefresh] = useState(false);
    const [selectedTab, setSelectedTab] = useState(0);
    const [createRuleData, setCreateRuleData] = useState({
        building_id: '62966c902f9fa606bbcd6084',
        action: [],
    });
    const [currentData, setCurrentData] = useState({});

    const [plugRuleData, setPlugRuleData] = useState([]);
    const [onlinePlugRuleData, setOnlinePlugRuleData] = useState([]);
    const [offlinePlugRuleData, setOfflinePlugRuleData] = useState([]);

    const handleCreatePlugRuleChange = (key, value) => {
        let obj = Object.assign({}, createRuleData);
        obj[key] = value;
        setCreateRuleData(obj);
    };

    const handleCurrentDataChange = (key, value) => {
        let obj = Object.assign({}, currentData);
        obj[key] = value;
        setCurrentData(obj);
    };

    const savePlugRuleData = async () => {
        try {
            let header = {
                'Content-Type': 'application/json',
                accept: 'application/json',
                'user-auth': '628f3144b712934f578be895',
            };
            setIsProcessing(true);

            await axios
                .post(`${BaseUrl}${createPlugRule}`, createRuleData, {
                    headers: header,
                })
                .then((res) => {
                    console.log(res.data);
                });

            setIsProcessing(false);
            setPageRefresh(!pageRefresh);
        } catch (error) {
            setIsProcessing(false);
            alert('Failed to create Plug Rule');
        }
    };

    const updatePlugRuleData = async () => {
        try {
            let header = {
                'Content-Type': 'application/json',
                accept: 'application/json',
                'user-auth': '628f3144b712934f578be895',
            };

            setIsProcessing(true);

            let params = `?role_id=${currentData.id}`;
            await axios
                .patch(`${BaseUrl}${updatePlugRule}${params}`, currentData, {
                    headers: header,
                })
                .then((res) => {
                    console.log(res.data);
                });

            setIsProcessing(false);
            setPageRefresh(!pageRefresh);
        } catch (error) {
            setIsProcessing(false);
            alert('Failed to update requested Plug Rule');
        }
    };

    useEffect(() => {
        const updateBreadcrumbStore = () => {
            BreadcrumbStore.update((bs) => {
                let newList = [
                    {
                        label: 'Plug Rules',
                        path: '/control/plug-rules',
                        active: true,
                    },
                ];
                bs.items = newList;
            });
        };
        updateBreadcrumbStore();
    }, []);

    useEffect(() => {
        const fetchPlugRuleData = async () => {
            try {
                let headers = {
                    'Content-Type': 'application/json',
                    accept: 'application/json',
                    'user-auth': '628f3144b712934f578be895',
                };
                let params = `?building_id=62966c902f9fa606bbcd6084`;
                await axios.get(`${BaseUrl}${listPlugRules}${params}`, { headers }).then((res) => {
                    let response = res.data;
                    setPlugRuleData(response.data);
                    let onlineData = [];
                    let offlineData = [];
                    response.data.forEach((record) => {
                        record.is_active ? onlineData.push(record) : offlineData.push(record);
                    });
                    setOnlinePlugRuleData(onlineData);
                    setOfflinePlugRuleData(offlineData);
                });
            } catch (error) {
                console.log(error);
                console.log('Failed to fetch list of Plug Rules data');
            }
        };
        fetchPlugRuleData();
    }, []);

    useEffect(() => {
        const fetchPlugRuleData = async () => {
            try {
                let headers = {
                    'Content-Type': 'application/json',
                    accept: 'application/json',
                    'user-auth': '628f3144b712934f578be895',
                };
                let params = `?building_id=62966c902f9fa606bbcd6084`;
                await axios.get(`${BaseUrl}${listPlugRules}${params}`, { headers }).then((res) => {
                    let response = res.data;
                    setPlugRuleData(response.data);
                    let onlineData = [];
                    let offlineData = [];
                    response.data.forEach((record) => {
                        record.is_active ? onlineData.push(record) : offlineData.push(record);
                    });
                    setOnlinePlugRuleData(onlineData);
                    setOfflinePlugRuleData(offlineData);
                });
            } catch (error) {
                console.log(error);
                console.log('Failed to fetch list of Plug Rules data');
            }
        };
        fetchPlugRuleData();
    }, [pageRefresh]);

    useEffect(() => {
        console.log('currentData => ', currentData);
    });

    return (
        <React.Fragment>
            <div className="plug-rules-header-style mt-4 ml-4 mr-3">
                <div className="plug-left-header">
                    <div className="plug-blg-name">NYPL</div>
                    <div className="plug-heading-style">Plug Rules</div>
                </div>
                <div className="btn-group custom-button-group" role="group" aria-label="Basic example">
                    <div className="mr-2">
                        <button
                            type="button"
                            className="btn btn-md btn-primary font-weight-bold"
                            onClick={() => {
                                handleAddRuleShow();
                            }}>
                            <FontAwesomeIcon icon={faPlus} size="md" className="mr-2" />
                            Add Rule
                        </button>
                    </div>
                </div>
            </div>

            <div className="plug-rules-header-style mt-4 ml-4 mr-4">
                <div className="plug-search-tabs-style">
                    <div className="search-container mr-2">
                        <FontAwesomeIcon icon={faMagnifyingGlass} size="md" />
                        <input className="search-box ml-2" type="search" name="search" placeholder="Search" />
                    </div>

                    <div className="btn-group ml-2" role="group" aria-label="Basic example">
                        <div>
                            <button
                                type="button"
                                className={
                                    selectedTab === 0
                                        ? 'btn btn-light d-offline custom-active-btn'
                                        : 'btn btn-white d-inline custom-inactive-btn'
                                }
                                style={{ borderTopRightRadius: '0px', borderBottomRightRadius: '0px' }}
                                onClick={() => setSelectedTab(0)}>
                                All Statuses
                            </button>

                            <button
                                type="button"
                                className={
                                    selectedTab === 1
                                        ? 'btn btn-light d-offline custom-active-btn'
                                        : 'btn btn-white d-inline custom-inactive-btn'
                                }
                                style={{ borderRadius: '0px' }}
                                onClick={() => setSelectedTab(1)}>
                                <i className="uil uil-wifi mr-1"></i>Online
                            </button>

                            <button
                                type="button"
                                className={
                                    selectedTab === 2
                                        ? 'btn btn-light d-offline custom-active-btn'
                                        : 'btn btn-white d-inline custom-inactive-btn'
                                }
                                style={{ borderTopLeftRadius: '0px', borderBottomLeftRadius: '0px' }}
                                onClick={() => setSelectedTab(2)}>
                                <i className="uil uil-wifi-slash mr-1"></i>Offline
                            </button>
                        </div>
                    </div>
                </div>

                <div>
                    <UncontrolledDropdown className="d-inline float-right">
                        <DropdownToggle color="white">
                            Columns
                            <i className="icon">
                                <ChevronDown></ChevronDown>
                            </i>
                        </DropdownToggle>
                        <DropdownMenu>
                            <DropdownItem>Phoenix Baker</DropdownItem>
                            <DropdownItem active={true} className="bg-primary">
                                Olivia Rhye
                            </DropdownItem>
                            <DropdownItem>Lana Steiner</DropdownItem>
                        </DropdownMenu>
                    </UncontrolledDropdown>
                </div>
            </div>

            <Row>
                <Col lg={8}>
                    {selectedTab === 0 && (
                        <PlugRuleTable
                            plugRuleData={plugRuleData}
                            handleEditRuleShow={handleEditRuleShow}
                            currentData={currentData}
                            setCurrentData={setCurrentData}
                            handleCurrentDataChange={handleCurrentDataChange}
                        />
                    )}
                    {selectedTab === 1 && (
                        <PlugRuleTable
                            plugRuleData={onlinePlugRuleData}
                            handleEditRuleShow={handleEditRuleShow}
                            currentData={currentData}
                            setCurrentData={setCurrentData}
                            handleCurrentDataChange={handleCurrentDataChange}
                        />
                    )}
                    {selectedTab === 2 && (
                        <PlugRuleTable
                            plugRuleData={offlinePlugRuleData}
                            handleEditRuleShow={handleEditRuleShow}
                            currentData={currentData}
                            setCurrentData={setCurrentData}
                            handleCurrentDataChange={handleCurrentDataChange}
                        />
                    )}
                </Col>
            </Row>

            {/* Add Rule Model  */}
            <Modal show={showAddRule} onHide={handleAddRuleClose} centered>
                <div className="mt-3 ml-3">
                    <Modal.Title>Add Plug Rule</Modal.Title>
                </div>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                            <Form.Label>Name</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter Name"
                                className="font-weight-bold"
                                onChange={(e) => {
                                    handleCreatePlugRuleChange('name', e.target.value);
                                }}
                                autoFocus
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter Description"
                                className="font-weight-bold"
                                onChange={(e) => {
                                    handleCreatePlugRuleChange('description', e.target.value);
                                }}
                            />
                        </Form.Group>

                        {/* <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                            <Form.Label>Socket Count</Form.Label>
                            <Form.Control
                                type="number"
                                placeholder="Enter Socket Count"
                                className="font-weight-bold"
                                onChange={(e) => {
                                    handleCreatePlugRuleChange('name', e.target.value);
                                }}
                            />
                        </Form.Group> */}
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="light" onClick={handleAddRuleClose}>
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={() => {
                            savePlugRuleData();
                            handleAddRuleClose();
                        }}
                        disabled={isProcessing}>
                        Save
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Edit Rule Model  */}
            <EditPlugRule
                showEditRule={showEditRule}
                handleEditRuleClose={handleEditRuleClose}
                currentData={currentData}
                setCurrentData={setCurrentData}
                handleCurrentDataChange={handleCurrentDataChange}
                updatePlugRuleData={updatePlugRuleData}
            />
        </React.Fragment>
    );
};

export default PlugRules;
