import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import { useHistory } from 'react-router-dom';
import { Row, Col, CardBody, CardHeader } from 'reactstrap';

import Typography from '../../../sharedComponents/typography';
import { Button } from '../../../sharedComponents/button';
import Brick from '../../../sharedComponents/brick';
import { Checkbox } from '../../../sharedComponents/form/checkbox';

import Target from './Target';
import Condition from './Condition';

import { UserStore } from '../../../store/UserStore';
import { BreadcrumbStore } from '../../../store/BreadcrumbStore';
import { ComponentStore } from '../../../store/ComponentStore';

import { ReactComponent as BanSVG } from '../../../assets/icon/ban.svg';
import { ReactComponent as DeleteSVG } from '../../../assets/icon/delete.svg';
import { ReactComponent as CheckMarkSVG } from '../../../assets/icon/check-mark.svg';
import { ReactComponent as UserProfileSVG } from '../../../assets/icon/user-profile.svg';
import { ReactComponent as EmailAddressSVG } from '../../../sharedComponents/assets/icons/email-address-icon.svg';

import { createAlertServiceAPI } from '../services';
import { fetchBuildingsList } from '../../../services/buildings';
import { getAllBuildingTypes } from '../../settings/general-settings/services';
import { formatConsumptionValue } from '../../../sharedComponents/helpers/helper';

import { bldgAlertConditions, defaultAlertObj, defaultConditionObj, filtersForEnergyConsumption } from '../constants';

import colorPalette from '../../../assets/scss/_colors.scss';
import './styles.scss';
import { getEquipTypeData } from '../../settings/equipment-type/services';

const CreateAlertHeader = (props) => {
    const { activeTab, setActiveTab, isAlertConfigured = false, onAlertCreate } = props;

    const history = useHistory();

    return (
        <div className="add-alerts-container d-flex flex-column justify-content-between">
            <div className="d-flex justify-content-between">
                <Typography.Header
                    size={Typography.Sizes.lg}
                    style={{ color: colorPalette.primaryGray700 }}
                    className="font-weight-bold">{`Create New Alert`}</Typography.Header>
                <div className="d-flex" style={{ gap: '0.75rem' }}>
                    {activeTab === 0 ? (
                        <Button
                            label={'Cancel'}
                            size={Button.Sizes.md}
                            type={Button.Type.secondaryGrey}
                            onClick={() => {
                                history.push({ pathname: '/alerts/overall' });
                            }}
                        />
                    ) : (
                        <Button
                            label={'Back'}
                            size={Button.Sizes.md}
                            type={Button.Type.secondaryGrey}
                            onClick={() => setActiveTab(0)}
                        />
                    )}

                    {activeTab === 0 ? (
                        <Button
                            label={'Next'}
                            size={Button.Sizes.md}
                            type={Button.Type.primary}
                            onClick={() => setActiveTab(1)}
                            disabled={!isAlertConfigured}
                        />
                    ) : (
                        <Button
                            label={'Save'}
                            size={Button.Sizes.md}
                            type={Button.Type.primary}
                            onClick={onAlertCreate}
                        />
                    )}
                </div>
            </div>
            <div className="arrow-tabs-container d-flex align-items-center">
                <Typography.Body
                    className={`mouse-pointer ${activeTab === 0 ? `` : `text-muted`}`}
                    size={Typography.Sizes.lg}
                    style={{
                        color: activeTab === 0 ? colorPalette.baseBlack : colorPalette.primaryGray500,
                    }}>
                    {isAlertConfigured ? (
                        <>
                            <CheckMarkSVG className="mouse-pointer mr-2" width={15} height={15} />
                            <span className="active-header-style">{`Select Target and Condition`}</span>
                        </>
                    ) : (
                        `Select Target and Condition`
                    )}
                </Typography.Body>

                <div className="arrow-line-style"></div>

                <Typography.Body
                    className={`mouse-pointer ${activeTab === 1 ? `` : `text-muted`}`}
                    size={Typography.Sizes.lg}
                    style={{ color: activeTab === 1 ? colorPalette.primaryGray900 : colorPalette.primaryGray500 }}>
                    {`Add Notification Methods`}
                </Typography.Body>
            </div>
        </div>
    );
};

const RemoveAlert = () => {
    return (
        <Row>
            <Col lg={9}>
                <div className="custom-card">
                    <CardHeader>
                        <Typography.Subheader size={Typography.Sizes.md} style={{ color: colorPalette.primaryGray550 }}>
                            {`Danger Zone`}
                        </Typography.Subheader>
                    </CardHeader>

                    <CardBody>
                        <Button
                            label="Remove Alert"
                            size={Button.Sizes.md}
                            type={Button.Type.primaryDistructive}
                            icon={<DeleteSVG />}
                            onClick={() => {
                                alert('Alert removed.');
                            }}
                        />
                    </CardBody>
                </div>
            </Col>
        </Row>
    );
};

const ConfigureAlerts = (props) => {
    const { alertObj = {}, updateAlertWithBuildingData, setTypeSelectedLabel } = props;

    const [isFetchingData, setFetching] = useState(false);

    const [buildingsList, setBuildingsList] = useState([]);
    const [originalBuildingsList, setOriginalBuildingsList] = useState([]);

    const [buildingTypeList, setBuildingTypeList] = useState([]);

    const [equipmentsList, setEquipmentsList] = useState([]);
    const [equipmentTypeList, setEquipmentTypeList] = useState([]);

    const filteredBuildingsList = (newBldgTypeList = [], originalBldgList) => {
        let newBldgList = [];
        if (newBldgTypeList.length !== 0) {
            originalBldgList.forEach((bldgObj) => {
                const isExist = newBldgTypeList.some((bldgTypeObj) => bldgTypeObj?.value === bldgObj?.building_type_id);
                if (isExist) newBldgList.push(bldgObj);
            });
        }
        return newBldgList;
    };

    const renderTargetedBuildingsList = (alert_obj, buildingsList = []) => {
        const count = alert_obj?.target?.lists?.length ?? 0;

        let label = '';

        if (count === 0) label = `No building selected.`;
        else if (count === buildingsList.length) label = `All Buildings selected.`;
        else if (count === 1) label = alertObj.target.lists[0].label;
        else if (count > 1) label = `${count} buildings selected.`;

        return label;
    };

    useEffect(() => {
        const label = renderTargetedBuildingsList(alertObj, originalBuildingsList);
        setTypeSelectedLabel(label);
    }, [alertObj?.target?.lists, originalBuildingsList]);

    useEffect(() => {
        if (alertObj?.target?.type === 'building') {
            setFetching(true);

            const promiseOne = getAllBuildingTypes();
            const promiseTwo = fetchBuildingsList(false);

            Promise.all([promiseOne, promiseTwo])
                .then((res) => {
                    const response = res;

                    if (response && response[0]?.status === 200 && response[1]?.status === 200) {
                        const buildingTypesResponse = response[0]?.data?.data?.data;
                        const buildingsListResponse = response[1]?.data;

                        if (buildingTypesResponse && buildingsListResponse) {
                            const newMappedBuildingTypesData = buildingTypesResponse.map((el) => ({
                                label: el?.building_type,
                                value: el?.building_type_id,
                            }));
                            setBuildingTypeList(newMappedBuildingTypesData);

                            const newMappedBldgsData = buildingsListResponse.map((el) => ({
                                label: el?.building_name,
                                value: el?.building_id,
                                building_type_id: el?.building_type_id,
                            }));
                            setOriginalBuildingsList(newMappedBldgsData);
                            setBuildingsList(newMappedBldgsData);

                            if (alertObj?.target?.typesList.length === 0 && alertObj?.target?.lists.length === 0) {
                                updateAlertWithBuildingData(newMappedBuildingTypesData, newMappedBldgsData);
                            } else {
                                const newFilteredBldgsList = filteredBuildingsList(
                                    alertObj?.target?.typesList,
                                    newMappedBldgsData
                                );
                                if (newFilteredBldgsList) setBuildingsList(newFilteredBldgsList);
                            }
                        }
                    }
                })
                .catch(() => {})
                .finally(() => {
                    setFetching(false);
                });
        }

        if (alertObj?.target?.type === 'equipment') {
            setFetching(true);
            setBuildingsList([]);

            const promiseOne = fetchBuildingsList(false);
            const promiseTwo = getEquipTypeData();

            Promise.all([promiseOne, promiseTwo])
                .then((res) => {
                    const response = res;

                    if (response && response[0]?.status === 200 && response[1]?.status === 200) {
                        const buildingsListResponse = response[0]?.data ?? [];
                        const equipTypesResponse = response[1]?.data?.data ?? [];

                        console.log('SSR buildingsListResponse => ', buildingsListResponse);
                        console.log('SSR equipTypesResponse => ', equipTypesResponse);

                        if (buildingsListResponse && equipTypesResponse) {
                            const newMappedBldgsData = buildingsListResponse.map((el) => ({
                                label: el?.building_name,
                                value: el?.building_id,
                                building_type_id: el?.building_type_id,
                            }));
                            setOriginalBuildingsList(newMappedBldgsData);
                            setBuildingsList(newMappedBldgsData);

                            const newMappedEquipTypesData = equipTypesResponse.map((el) => ({
                                label: el?.equipment_type,
                                value: el?.equipment_id,
                            }));
                            setEquipmentTypeList(newMappedEquipTypesData);
                        }
                    }
                })
                .catch(() => {})
                .finally(() => {
                    setFetching(false);
                });
        }
    }, [alertObj?.target?.type]);

    return (
        <>
            <Row>
                <Col lg={9}>
                    <Target
                        isFetchingData={isFetchingData}
                        buildingsList={buildingsList}
                        originalBuildingsList={originalBuildingsList}
                        buildingTypeList={buildingTypeList}
                        equipmentTypeList={equipmentTypeList}
                        equipmentsList={equipmentsList}
                        renderTargetedBuildingsList={renderTargetedBuildingsList}
                        filteredBuildingsList={filteredBuildingsList}
                        setBuildingsList={setBuildingsList}
                        {...props}
                    />
                </Col>
            </Row>

            <Brick sizeInRem={2} />

            <Row>
                <Col lg={9}>
                    <Condition {...props} />
                </Col>
            </Row>

            <Brick sizeInRem={2} />
        </>
    );
};

const NotificationSettings = (props) => {
    const { alertObj = {}, typeSelectedLabel = '', handleConditionChange, handleNotificationChange } = props;

    const targetType = alertObj?.target?.type === `building` ? `Building` : `Equipment`;

    const renderAlertCondition = (alert_obj) => {
        let text = '';

        let alertType = bldgAlertConditions.find((el) => el?.value === alert_obj?.condition?.type);
        if (alertType) text += alertType?.label;

        if (alert_obj?.condition?.level) text += ` ${alert_obj?.condition?.level}`;

        if (alertObj?.condition?.filterType === 'number' && alert_obj?.condition?.thresholdValue)
            text += ` ${formatConsumptionValue(+alert_obj?.condition?.thresholdValue, 2)} kWh`;

        if (alertObj?.condition?.filterType !== 'number') {
            let alertFilter = filtersForEnergyConsumption.find((el) => el?.value === alertObj?.condition?.filterType);
            if (alertFilter) text += ` ${alertFilter?.label}`;
        }

        return `${text}.`;
    };

    return (
        <>
            <Row>
                <Col lg={9}>
                    <div className="custom-card">
                        <CardHeader>
                            <Typography.Subheader
                                size={Typography.Sizes.md}
                                style={{ color: colorPalette.primaryGray550 }}>
                                {`Alert Preview`}
                            </Typography.Subheader>
                        </CardHeader>
                        <CardBody>
                            <div>
                                <Typography.Subheader size={Typography.Sizes.md}>{`Target Type`}</Typography.Subheader>
                                <Brick sizeInRem={0.25} />
                                <Typography.Body size={Typography.Sizes.md} className="text-muted">
                                    {targetType}
                                </Typography.Body>
                            </div>

                            <Brick sizeInRem={1} />

                            <div>
                                <Typography.Subheader size={Typography.Sizes.md}>{targetType}</Typography.Subheader>
                                <Brick sizeInRem={0.25} />
                                <Typography.Body size={Typography.Sizes.md} className="text-muted">
                                    {typeSelectedLabel && typeSelectedLabel}
                                </Typography.Body>
                            </div>

                            <Brick sizeInRem={0.5} />

                            <div>
                                <Typography.Subheader size={Typography.Sizes.md}>{`Condition`}</Typography.Subheader>
                                <Brick sizeInRem={0.25} />
                                <Typography.Body size={Typography.Sizes.md} className="text-muted">
                                    {renderAlertCondition(alertObj)}
                                </Typography.Body>
                            </div>

                            <Brick sizeInRem={1} />

                            {alertObj?.condition?.type === 'energy_consumption' && (
                                <div className="d-flex" style={{ gap: '1rem' }}>
                                    <Checkbox
                                        label="Alert at 50%"
                                        type="checkbox"
                                        id="50-percent-alert"
                                        name="50-percent-alert"
                                        size="md"
                                        checked={alertObj?.condition?.threshold50}
                                        value={alertObj?.condition?.threshold50}
                                        onClick={(e) => {
                                            handleConditionChange(
                                                'threshold50',
                                                e.target.value === 'false' ? true : false
                                            );
                                        }}
                                    />
                                    <Checkbox
                                        label="Alert at 75%"
                                        type="checkbox"
                                        id="75-percent-alert"
                                        name="75-percent-alert"
                                        size="md"
                                        checked={alertObj?.condition?.threshold75}
                                        value={alertObj?.condition?.threshold75}
                                        onClick={(e) => {
                                            handleConditionChange(
                                                'threshold75',
                                                e.target.value === 'false' ? true : false
                                            );
                                        }}
                                    />
                                </div>
                            )}

                            {alertObj?.condition?.type === 'peak_demand' && (
                                <Checkbox
                                    label="Alert at 90%"
                                    type="checkbox"
                                    id="90-percent-alert"
                                    name="90-percent-alert"
                                    size="md"
                                    checked={alertObj?.condition?.threshold90}
                                    value={alertObj?.condition?.threshold90}
                                    onClick={(e) => {
                                        handleConditionChange('threshold90', e.target.value === 'false' ? true : false);
                                    }}
                                />
                            )}
                        </CardBody>
                    </div>
                </Col>
            </Row>

            <Brick sizeInRem={2} />

            <Row>
                <Col lg={9}>
                    <Typography.Header
                        size={Typography.Sizes.xs}>{`Add Notification Method (optional)`}</Typography.Header>
                    <Brick sizeInRem={0.25} />
                    <Typography.Body size={Typography.Sizes.md}>
                        {`These are all notification methods available given your selected target and condition.`}
                    </Typography.Body>
                </Col>
            </Row>

            <Brick sizeInRem={2} />

            <Row>
                <Col lg={9}>
                    <div className="custom-card">
                        <CardHeader>
                            <Typography.Subheader
                                size={Typography.Sizes.md}
                                style={{ color: colorPalette.primaryGray550 }}>
                                {`Notification Method (optional)`}
                            </Typography.Subheader>
                        </CardHeader>
                        <CardBody>
                            <div className="d-flex align-items-center" style={{ gap: '0.75rem' }}>
                                <div
                                    className={`d-flex align-items-center mouse-pointer ${
                                        alertObj?.notification?.method === 'none'
                                            ? `notify-container-active`
                                            : `notify-container`
                                    }`}
                                    onClick={() => handleNotificationChange('method', 'none')}>
                                    <BanSVG className="p-0 square" width={20} height={20} />
                                    <Typography.Subheader
                                        size={Typography.Sizes.md}
                                        style={{ color: colorPalette.primaryGray700 }}>
                                        {`None`}
                                    </Typography.Subheader>
                                </div>

                                <div
                                    className={`d-flex align-items-center mouse-pointer ${
                                        alertObj?.notification?.method === 'user'
                                            ? `notify-container-active`
                                            : `notify-container`
                                    }`}
                                    onClick={() => handleNotificationChange('method', 'user')}>
                                    <UserProfileSVG className="p-0 square" width={18} height={18} />
                                    <Typography.Subheader
                                        size={Typography.Sizes.md}
                                        style={{ color: colorPalette.primaryGray700 }}>
                                        {`User`}
                                    </Typography.Subheader>
                                </div>

                                <div
                                    className={`d-flex align-items-center mouse-pointer ${
                                        alertObj?.notification?.method === 'email'
                                            ? `notify-container-active`
                                            : `notify-container`
                                    }`}
                                    onClick={() => handleNotificationChange('method', 'email')}>
                                    <EmailAddressSVG className="p-0 square" width={20} height={20} />
                                    <Typography.Subheader
                                        size={Typography.Sizes.md}
                                        style={{ color: colorPalette.primaryGray700 }}>
                                        {`Email Address`}
                                    </Typography.Subheader>
                                </div>
                            </div>
                        </CardBody>
                    </div>
                </Col>
            </Row>

            <Brick sizeInRem={2} />
        </>
    );
};

const AddAlerts = () => {
    const [activeTab, setActiveTab] = useState(0);
    const [alertObj, setAlertObj] = useState(defaultAlertObj);
    console.log('SSR alertObj => ', alertObj);
    const [typeSelectedLabel, setTypeSelectedLabel] = useState(null);

    const handleTargetChange = (key, value) => {
        let obj = Object.assign({}, alertObj);
        if (key === 'type' && obj?.target?.type !== value) obj = _.cloneDeep(defaultAlertObj);
        obj.target[key] = value;
        setAlertObj(obj);
    };

    const handleConditionChange = (key, value) => {
        let obj = Object.assign({}, alertObj);

        // When condition Type change
        if (key === 'type') {
            obj.condition = _.cloneDeep(defaultConditionObj);
        }

        // When condition filter-type change
        if (key === 'filterType') {
            obj.condition.threshold50 = false;
            obj.condition.threshold75 = false;
            obj.condition.threshold90 = false;
            obj.condition.thresholdValue = '';
        }

        obj.condition[key] = value;
        setAlertObj(obj);
    };

    const handleNotificationChange = (key, value) => {
        let obj = Object.assign({}, alertObj);

        obj.notification[key] = value;
        setAlertObj(obj);
    };

    const updateAlertWithBuildingData = (bldg_type_list, bldgs_list) => {
        let obj = Object.assign({}, alertObj);
        obj.target.typesList = bldg_type_list ?? [];
        obj.target.lists = bldgs_list ?? [];
        setAlertObj(obj);
    };

    const handleCreateAlert = async (alert_obj) => {
        if (!alert_obj) return;

        let payload = {
            target: alert_obj?.target?.type,
            // building_id: 'string',
            target_type: alert_obj?.target?.typesList.map((item) => item?.value),
            target_list: alert_obj?.target?.lists.map((item) => item?.value),
            condition: alert_obj?.condition?.type,
            // condition_interval_period: 1,
            condition_type: alert_obj?.condition?.level,
            threshold_at: [],
            notify_type: alert_obj?.notification?.method,
            // notify_to: 'string',
            // notify_condition: 'immediate',
            // notify_in: 0,
            // snooze: 0,
        };

        if (alert_obj?.condition?.level === 'number' && alert_obj?.condition?.thresholdValue) {
            payload.condition_threshold = alert_obj?.condition?.thresholdValue;
        }

        if (alert_obj?.condition?.threshold50) payload.threshold_at.push(50);
        if (alert_obj?.condition?.threshold75) payload.threshold_at.push(75);
        if (alert_obj?.condition?.threshold90) payload.threshold_at.push(90);

        if (alert_obj?.condition?.filterType !== 'number') {
            if (alert_obj?.condition?.filterType.includes('month')) payload.condition_interval = 'month';
            if (alert_obj?.condition?.filterType.includes('year')) payload.condition_interval = 'year';
        }

        await createAlertServiceAPI(payload)
            .then((res) => {
                const response = res?.data;
                if (response?.success) {
                    UserStore.update((s) => {
                        s.showNotification = true;
                        s.notificationMessage = 'Alert created successfully.';
                        s.notificationType = 'success';
                    });
                } else {
                    UserStore.update((s) => {
                        s.showNotification = true;
                        s.notificationMessage = 'Failed to create Alert.';
                        s.notificationType = 'error';
                    });
                }
            })
            .catch(() => {
                UserStore.update((s) => {
                    s.showNotification = true;
                    s.notificationMessage = 'Failed to create Alert status due to Internal Server Error.';
                    s.notificationType = 'error';
                });
            })
            .finally(() => {});
    };

    const updateBreadcrumbStore = () => {
        BreadcrumbStore.update((bs) => {
            let newList = [
                {
                    label: 'Alerts',
                    path: '/alerts/overall',
                    active: false,
                },
                {
                    label: 'Create Alert',
                    path: '/alerts/overall/add-alert',
                    active: true,
                },
            ];
            bs.items = newList;
        });
        ComponentStore.update((s) => {
            s.parent = 'alerts';
        });
    };

    const isAlertConfigured =
        alertObj?.target?.type !== '' &&
        alertObj?.target?.lists.length !== 0 &&
        alertObj?.target?.submitted &&
        alertObj?.condition?.type !== '' &&
        ((alertObj?.condition?.filterType === 'number' && alertObj?.condition?.thresholdValue !== '') ||
            alertObj?.condition?.filterType !== 'number');

    useEffect(() => {
        updateBreadcrumbStore();
    }, []);

    return (
        <React.Fragment>
            <Row>
                <Col lg={12}>
                    <CreateAlertHeader
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                        isAlertConfigured={isAlertConfigured}
                        onAlertCreate={() => {
                            handleCreateAlert(alertObj);
                        }}
                    />
                </Col>
            </Row>

            <div className="custom-padding">
                {activeTab === 0 && (
                    <ConfigureAlerts
                        alertObj={alertObj}
                        handleTargetChange={handleTargetChange}
                        handleConditionChange={handleConditionChange}
                        updateAlertWithBuildingData={updateAlertWithBuildingData}
                        setTypeSelectedLabel={setTypeSelectedLabel}
                    />
                )}

                {activeTab === 1 && (
                    <NotificationSettings
                        alertObj={alertObj}
                        typeSelectedLabel={typeSelectedLabel}
                        handleConditionChange={handleConditionChange}
                        handleNotificationChange={handleNotificationChange}
                    />
                )}
            </div>
        </React.Fragment>
    );
};

export default AddAlerts;
