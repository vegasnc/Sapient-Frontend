import React, { useState } from 'react';
import {
    Row,
    Col,
    Label,
    Input,
    FormGroup,
    Card,
    CardBody,
    Table,
    UncontrolledDropdown,
    DropdownMenu,
    DropdownToggle,
    DropdownItem,
} from 'reactstrap';
import { Link } from 'react-router-dom';
import '../style.css';

const CreatePanel = () => {
    const [breakersCount, setBreakersCount] = useState([
        { serialNo: 1, name: '' },
        { serialNo: 2, name: '' },
        { serialNo: 3, name: '' },
        { serialNo: 4, name: '' },
        { serialNo: 5, name: '' },
        { serialNo: 6, name: '' },
        { serialNo: 7, name: '' },
        { serialNo: 8, name: '' },
        { serialNo: 9, name: '' },
        { serialNo: 10, name: '' },
        { serialNo: 11, name: '' },
        { serialNo: 12, name: '' },
        { serialNo: 13, name: '' },
        { serialNo: 14, name: '' },
        { serialNo: 15, name: '' },
        { serialNo: 16, name: '' },
        { serialNo: 17, name: '' },
        { serialNo: 18, name: '' },
        { serialNo: 19, name: '' },
        { serialNo: 20, name: '' },
        { serialNo: 21, name: '' },
        { serialNo: 22, name: '' },
        { serialNo: 23, name: '' },
        { serialNo: 24, name: '' },
        { serialNo: 25, name: '' },
        { serialNo: 26, name: '' },
        { serialNo: 27, name: '' },
        { serialNo: 28, name: '' },
        { serialNo: 29, name: '' },
        { serialNo: 30, name: '' },
        { serialNo: 31, name: '' },
        { serialNo: 32, name: '' },
        { serialNo: 33, name: '' },
        { serialNo: 34, name: '' },
        { serialNo: 35, name: '' },
        { serialNo: 36, name: '' },
        { serialNo: 37, name: '' },
        { serialNo: 38, name: '' },
        { serialNo: 39, name: '' },
        { serialNo: 40, name: '' },
        { serialNo: 41, name: '' },
        { serialNo: 42, name: '' },
        { serialNo: 43, name: '' },
        { serialNo: 44, name: '' },
        { serialNo: 45, name: '' },
        { serialNo: 46, name: '' },
        { serialNo: 47, name: '' },
        { serialNo: 48, name: '' },
    ]);

    return (
        <React.Fragment>
            <Row className="page-title" style={{ marginLeft: '20px' }}>
                <Col className="header-container" xl={10}>
                    <span className="heading-style">New Panel</span>

                    <div className="btn-group custom-button-group" role="group" aria-label="Basic example">
                        <div className="float-right ml-2">
                            <Link to="/settings/createPanel">
                                <button type="button" className="btn btn-md btn-light font-weight-bold mr-2">
                                    Cancel
                                </button>
                            </Link>
                            <Link to="/settings/createPanel">
                                <button type="button" className="btn btn-md btn-primary font-weight-bold">
                                    Save
                                </button>
                            </Link>
                        </div>
                    </div>
                </Col>
            </Row>

            <Row style={{ marginLeft: '20px' }}>
                <Col xl={10}>
                    <div className="grid-style-5 mt-4">
                        <FormGroup>
                            <Label for="panelName" className="card-title">
                                Name
                            </Label>
                            <Input type="text" name="panelName" id="panelName" placeholder="Panel Name" />
                        </FormGroup>

                        <FormGroup>
                            <Label for="userState" className="card-title">
                                Parent Panel
                            </Label>
                            <Input type="select" name="state" id="userState" className="font-weight-bold">
                                <option>None</option>
                                <option>Olivia Rhye</option>
                                <option>Drew Cano</option>
                            </Input>
                        </FormGroup>

                        <FormGroup>
                            <Label for="location" className="card-title">
                                Location
                            </Label>
                            <Input type="text" name="location" id="useLocation" placeholder="Select Location" />
                        </FormGroup>
                    </div>
                </Col>
            </Row>

            <Row style={{ marginLeft: '20px' }}>
                <Col xl={10}>
                    <div className="panel-container-style mt-4">
                        <Row>
                            <Col lg={3}>
                                <div>
                                    <FormGroup className="form-group row m-4">
                                        <Label for="panelName" className="card-title">
                                            Number of Breakers
                                        </Label>
                                        <Input
                                            type="number"
                                            name="breakers"
                                            id="breakers"
                                            defaultValue={breakersCount.length}
                                        />
                                    </FormGroup>
                                </div>
                            </Col>
                            <Col lg={9}>
                                <div className="float-right m-4">
                                    <button type="button" className="btn btn-md btn-secondary font-weight-bold ">
                                        Done
                                    </button>
                                </div>
                            </Col>
                        </Row>

                        <Row>
                            <Col lg={4}></Col>
                            <Col lg={4}>
                                <FormGroup className="form-group row m-4">
                                    <div className="breaker-container">
                                        <div className="breaker-style">
                                            <div className="breaker-content-middle">
                                                <div className="breaker-index">1</div>
                                            </div>
                                            <div className="breaker-content-middle">
                                                <div className="dot-status"></div>
                                            </div>
                                            <div className="breaker-content-middle">
                                                <div className="breaker-content">
                                                    <span>200A</span>
                                                    <span>240V</span>
                                                </div>
                                            </div>
                                            <div className="breaker-content-middle">
                                                <div className="edit-icon-bg-styling">
                                                    <i className="uil uil-pen"></i>
                                                </div>
                                            </div>
                                            <div className="breaker-content-middle">
                                                <span className="font-weight-bold edit-btn-styling">Edit</span>
                                            </div>
                                        </div>
                                    </div>
                                </FormGroup>
                            </Col>
                            <Col lg={4}></Col>
                        </Row>

                        <Row>
                            <Col lg={12}>
                                <div>
                                    <div className="grid-style-6">
                                        {breakersCount.map((breaker, index) => {
                                            return (
                                                <FormGroup className="form-group row m-2 ml-4">
                                                    <div className="breaker-container">
                                                        <div className="sub-breaker-style">
                                                            <div className="breaker-content-middle">
                                                                <div className="breaker-index">{breaker.serialNo}</div>
                                                            </div>
                                                            <div className="breaker-content-middle">
                                                                <div className="dot-status"></div>
                                                            </div>
                                                            <div className="breaker-content-middle">
                                                                <div className="breaker-content">
                                                                    <span>20A</span>
                                                                    <span>120V</span>
                                                                </div>
                                                            </div>
                                                            <div className="breaker-content-middle">
                                                                <div className="edit-icon-bg-styling">
                                                                    <i className="uil uil-pen"></i>
                                                                </div>
                                                            </div>
                                                            <div className="breaker-content-middle">
                                                                <span className="font-weight-bold edit-btn-styling">
                                                                    Edit
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </FormGroup>
                                            );
                                        })}
                                    </div>
                                </div>
                            </Col>
                        </Row>
                    </div>
                </Col>
            </Row>
        </React.Fragment>
    );
};

export default CreatePanel;