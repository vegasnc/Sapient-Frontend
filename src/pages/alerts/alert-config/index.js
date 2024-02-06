import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import { useHistory, useParams } from 'react-router-dom';
import { Row, Col, CardBody, CardHeader } from 'reactstrap';

import Typography from '../../../sharedComponents/typography';
import { Button } from '../../../sharedComponents/button';
import Brick from '../../../sharedComponents/brick';

import Target from './Target';
import Condition from './Condition';
import AlertPreview from './AlertPreview';
import BuildingConfig from './target-type-config/BuildingConfig';
import EquipConfig from './target-type-config/EquipConfig';
import NotificationMethod from './NotificationMethod';
import InputTooltip from '../../../sharedComponents/form/input/InputTooltip';
import Textarea from '../../../sharedComponents/form/textarea/Textarea';

import { UserStore } from '../../../store/UserStore';
import { BreadcrumbStore } from '../../../store/BreadcrumbStore';
import { ComponentStore } from '../../../store/ComponentStore';

import { ReactComponent as DeleteSVG } from '../../../assets/icon/delete.svg';
import { ReactComponent as CheckMarkSVG } from '../../../assets/icon/check-mark.svg';

import { createAlertServiceAPI, fetchConfiguredAlertById } from '../services';

import {
    TARGET_TYPES,
    bldgAlertConditions,
    defaultAlertObj,
    defaultConditionObj,
    defaultNotificationObj,
    equipAlertConditions,
    filtersForEnergyConsumption,
} from '../constants';
import { formatConsumptionValue } from '../../../sharedComponents/helpers/helper';

import colorPalette from '../../../assets/scss/_colors.scss';
import './styles.scss';

const CreateAlertHeader = (props) => {
    const {
        activeTab,
        setActiveTab,
        isAlertConfigured = false,
        onAlertCreate,
        reqType,
        isCreatingAlert = false,
        renderAlertCondition,
        alertObj,
    } = props;

    const history = useHistory();

    return (
        <div className="add-alerts-container d-flex flex-column justify-content-between">
            <div className="d-flex justify-content-between">
                <Typography.Header
                    size={Typography.Sizes.lg}
                    style={{ color: colorPalette.primaryGray700 }}
                    className="font-weight-bold">
                    {`${reqType === 'create' ? `Create New` : `Edit`} Alert`}
                </Typography.Header>
                <div className="d-flex" style={{ gap: '0.75rem' }}>
                    {activeTab === 0 ? (
                        <Button
                            label={'Cancel'}
                            size={Button.Sizes.md}
                            type={Button.Type.secondaryGrey}
                            onClick={() => {
                                history.push({ pathname: '/alerts/overview/open-alerts' });
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
                            onClick={() => {
                                renderAlertCondition(alertObj);
                                setActiveTab(1);
                            }}
                            disabled={!isAlertConfigured}
                        />
                    ) : (
                        <Button
                            label={'Save'}
                            size={Button.Sizes.md}
                            type={Button.Type.primary}
                            onClick={onAlertCreate}
                            disabled={isCreatingAlert}
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
    const { alertObj = {}, setTypeSelectedLabel, originalBldgsList, originalEquipsList, handleChange } = props;

    const renderTargetedList = (alert_obj, originalDataList = []) => {
        const count = alert_obj?.target?.lists?.length ?? 0;
        const targetType = alert_obj?.target?.type;

        let label = '';

        if (count === 0) label = `No ${targetType} selected.`;
        else if (count === 1) label = alertObj.target.lists[0].label;
        else if (count > 1) label = `${count} ${targetType}s selected.`;

        return label;
    };

    const renderTargetTypeHeader = (alert_obj) => {
        let label = '';
        if (alert_obj?.target?.type === TARGET_TYPES.BUILDING) label = 'Building';
        if (alert_obj?.target?.type === TARGET_TYPES.EQUIPMENT) label = 'Equipment';
        return label;
    };

    useEffect(() => {
        let label = '';
        if (alertObj?.target?.type === TARGET_TYPES.BUILDING) {
            label = renderTargetedList(alertObj, originalBldgsList);
        }
        if (alertObj?.target?.type === TARGET_TYPES.EQUIPMENT) {
            label = renderTargetedList(alertObj, originalEquipsList);
        }
        setTypeSelectedLabel(label);
    }, [alertObj?.target?.lists, originalBldgsList]);

    return (
        <>
            <Row>
                <Col lg={9}>
                    <div className="w-50">
                        <Typography.Body size={Typography.Sizes.md}>
                            Alert Name
                            <span style={{ color: colorPalette.error600 }} className="font-weight-bold ml-1">
                                *
                            </span>
                        </Typography.Body>
                        <Brick sizeInRem={0.25} />
                        <InputTooltip
                            placeholder="Enter Alert Name"
                            type="text"
                            onChange={(e) => {
                                handleChange('alert_name', e.target.value);
                            }}
                            labelSize={Typography.Sizes.md}
                            value={alertObj?.alert_name}
                        />
                    </div>

                    <Brick sizeInRem={2} />

                    <Target
                        renderTargetedList={renderTargetedList}
                        renderTargetTypeHeader={renderTargetTypeHeader}
                        {...props}
                    />
                </Col>
            </Row>

            <Brick sizeInRem={2} />

            <Row>
                <Col lg={9}>
                    <Condition {...props} />

                    <Brick sizeInRem={2} />

                    <div className="w-100">
                        <Typography.Body size={Typography.Sizes.md}>Alert Description</Typography.Body>
                        <Brick sizeInRem={0.25} />
                        <Textarea
                            type="textarea"
                            rows="4"
                            placeholder="Enter Alert description..."
                            value={alertObj?.alert_description}
                            onChange={(e) => {
                                handleChange('alert_description', e.target.value);
                            }}
                            inputClassName="pt-2"
                        />
                    </div>
                </Col>
            </Row>

            <Brick sizeInRem={2} />
        </>
    );
};

const NotificationSettings = (props) => {
    return (
        <>
            <AlertPreview {...props} />
            <Brick sizeInRem={2} />

            <NotificationMethod {...props} />
            <Brick sizeInRem={2} />
        </>
    );
};

const AlertConfig = () => {
    const { reqType, alertId } = useParams();
    const history = useHistory();

    const [activeTab, setActiveTab] = useState(0);
    const defaultAlertObjCloned = _.cloneDeep(defaultAlertObj);
    const [alertObj, setAlertObj] = useState(defaultAlertObjCloned);

    const [originalBldgsList, setOriginalBldgsList] = useState([]);
    const [originalEquipsList, setOriginalEquipsList] = useState([]);

    const [typeSelectedLabel, setTypeSelectedLabel] = useState(null);

    const [isCreatingAlert, setCreating] = useState(false);
    const [isFetchingAlertData, setFetchingAlertData] = useState(false);

    // Building Configuration Modal
    const [showBldgConfigModal, setBldgConfigModalStatus] = useState(false);
    const closeBldgConfigModel = () => setBldgConfigModalStatus(false);
    const openBldgConfigModel = () => setBldgConfigModalStatus(true);

    // Equipment Configuration Modal
    const [showEquipConfigModal, setEquipConfigModalStatus] = useState(false);
    const closeEquipConfigModel = () => setEquipConfigModalStatus(false);
    const openEquipConfigModel = () => setEquipConfigModalStatus(true);

    const isBuildingConfigured =
        alertObj?.target?.type === TARGET_TYPES.BUILDING && alertObj?.target?.lists.length !== 0;

    const isEquipmentConfigured =
        alertObj?.target?.type === TARGET_TYPES.EQUIPMENT &&
        alertObj?.target?.lists.length !== 0 &&
        alertObj?.target?.buildingIDs !== '';

    const isConditionSet = alertObj?.condition?.type !== '';

    const isBuildingConditionsSet =
        alertObj?.target?.type === TARGET_TYPES.BUILDING &&
        (alertObj?.condition?.filterType === 'previous_month' ||
            alertObj?.condition?.filterType === 'previous_year' ||
            (alertObj?.condition?.filterType === 'number' && alertObj?.condition?.thresholdValue !== ''));

    const isEquipmentConditionsSet =
        alertObj?.target?.type === TARGET_TYPES.EQUIPMENT &&
        ((alertObj?.condition?.type === 'rms_current' && alertObj?.condition?.thresholdPercentage !== '') ||
            (alertObj?.condition?.type === 'shortcycling' && alertObj?.condition?.shortcyclingMinutes !== '') ||
            (alertObj?.condition?.type !== 'rms_current' &&
                alertObj?.condition?.type !== 'shortcycling' &&
                alertObj?.condition?.thresholdPercentage !== ''));

    const isAlertNameSet = alertObj?.alert_name !== '';
    const isTargetConfigured = isBuildingConfigured || isEquipmentConfigured;
    const isConditionConfigured = isConditionSet && (isBuildingConditionsSet || isEquipmentConditionsSet);

    const handleModalClick = (configType) => {
        if (configType) {
            if (configType === TARGET_TYPES.BUILDING) openBldgConfigModel();
            if (configType === TARGET_TYPES.EQUIPMENT) openEquipConfigModel();
        }
    };

    const handleChange = (key, value) => {
        let obj = Object.assign({}, alertObj);
        obj[key] = value;
        setAlertObj(obj);
    };

    const handleTargetChange = (key, value) => {
        let obj = Object.assign({}, alertObj);
        obj.target[key] = value;
        setAlertObj(obj);
    };

    const handleRecurrenceChange = (key, value) => {
        let obj = Object.assign({}, alertObj);
        obj.recurrence[key] = value;
        setAlertObj(obj);
    };

    const handleConditionChange = (key, value) => {
        let obj = Object.assign({}, alertObj);

        // When Condition Type change
        if (key === 'type') {
            obj.condition = _.cloneDeep(defaultConditionObj);
        }

        // When Condition filter-type change
        if (key === 'filterType') {
            obj.condition.threshold50 = true;
            obj.condition.threshold75 = true;
            obj.condition.threshold90 = true;
            obj.condition.thresholdValue = '';
        }

        obj.condition[key] = value;
        setAlertObj(obj);
    };

    const handleNotificationChange = (key, value) => {
        let obj = Object.assign({}, alertObj);

        // When Notification Method change
        if (key === 'method') {
            obj.notification = _.cloneDeep(defaultNotificationObj);
        }

        obj.notification[key] = value;
        setAlertObj(obj);
    };

    const renderAlertCondition = (alert_obj) => {
        let text = '';

        if (alert_obj?.target?.type === TARGET_TYPES.BUILDING) {
            let alertType = bldgAlertConditions.find((el) => el?.value === alert_obj?.condition?.type);
            if (alertType) text += `${alertType?.label} the`;

            if (alert_obj?.condition?.timeInterval) text += ` ${alert_obj?.condition?.timeInterval} is`;

            if (alert_obj?.condition?.level) text += ` ${alert_obj?.condition?.level}`;

            if (alertObj?.condition?.filterType === 'number' && alert_obj?.condition?.thresholdValue)
                text += ` ${formatConsumptionValue(+alert_obj?.condition?.thresholdValue, 2)} kWh`;

            if (alertObj?.condition?.filterType !== 'number') {
                let alertFilter = filtersForEnergyConsumption.find(
                    (el) => el?.value === alertObj?.condition?.filterType
                );
                if (alertFilter) text += ` ${alertFilter?.label}`;
            }
        }

        if (alert_obj?.target?.type === TARGET_TYPES.EQUIPMENT) {
            let alertType = equipAlertConditions.find((el) => el?.value === alert_obj?.condition?.type);
            if (alertType) text += alertType?.label;

            if (alert_obj?.condition?.level) text += ` ${alert_obj?.condition?.level}`;

            if (alert_obj?.condition?.type === 'shortcycling') {
                text += ` ${alert_obj?.condition?.shortcyclingMinutes} min.`;
            } else {
                text += ` ${alert_obj?.condition?.thresholdPercentage}%`;
            }
        }

        handleConditionChange('conditionDescription', `${text}.`);
    };

    const handleCreateAlert = async (alert_obj) => {
        if (!alert_obj) return;

        setCreating(true);

        const { target, recurrence, condition, notification } = alert_obj;

        // Alert Payload
        let payload = {
            target_type: target?.type,
            target_description: alert_obj?.alert_name,
            description: alert_obj?.alert_description,
            alert_condition_description: condition?.conditionDescription,
        };

        // When Target type is 'Building'
        if (target?.type === TARGET_TYPES.BUILDING) {
            let bldgObj = {
                building_ids: target?.lists.map((el) => el?.value),
                condition_metric: condition?.type,
                condition_timespan: condition?.timeInterval,
                condition_operator: condition?.level,
                condition_threshold_type: condition?.filterType,
                condition_alert_at: [],
            };

            if (condition?.filterType === 'number') {
                bldgObj.condition_threshold_value = +condition?.thresholdValue;
            }

            if (condition?.threshold50) bldgObj.condition_alert_at.push(50);
            if (condition?.threshold75) bldgObj.condition_alert_at.push(75);
            if (condition?.threshold100) bldgObj.condition_alert_at.push(100);

            payload = { ...payload, ...bldgObj };
        }

        // When Target type is 'Equipment'
        if (target?.type === TARGET_TYPES.EQUIPMENT) {
            let equipObj = {
                building_ids: [target?.buildingIDs],
                equipment_ids: target?.lists.map((el) => el?.value),
                condition_metric: condition?.type,
                condition_operator: condition?.level,
                condition_threshold_value: +condition?.thresholdPercentage,
            };

            if (condition?.type === 'rms_current') {
                equipObj.custom_threshold_type = condition?.thresholdName;
            }

            if (condition?.type !== 'shortcycling') {
                equipObj.condition_threshold_type = 'percentage';
            }

            if (condition?.type === 'shortcycling') {
                equipObj.condition_threshold_value = +condition?.shortcyclingMinutes;
            }

            if (recurrence?.triggerAlert) {
                equipObj.equipment_condition_recurrence = recurrence?.triggerAlert;
                equipObj.equipment_condition_recurrence_minutes = +recurrence?.triggerAt;
            }

            payload = { ...payload, ...equipObj };
        }

        // Notification and its recurrence setup
        const method = notification?.method[0];

        if (method === 'email') payload.alert_emails = notification?.selectedUserEmailId;
        if (method === 'user') payload.alert_user_ids = notification?.selectedUserId.map((el) => el?.value);

        if ((method === 'email' || method === 'user') && recurrence?.resendAlert) {
            payload.alert_recurrence = recurrence?.resendAlert;
            payload.alert_recurrence_minutes = +recurrence?.resendAt;
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
                    history.push({
                        pathname: '/alerts/overview/alert-settings',
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
            .finally(() => {
                setCreating(false);
            });
    };

    const getConfiguredAlertById = async (alert_id) => {
        if (!alert_id) return;

        setFetchingAlertData(true);

        await fetchConfiguredAlertById(alert_id)
            .then((res) => {
                const response = res?.data;
                const { success: isSuccessful, data } = response;
                if (isSuccessful && data && data?.id) {
                    console.log('SSR selected alert obj => ', data);
                }
            })
            .catch(() => {})
            .finally(() => {
                setFetchingAlertData(false);
            });
    };

    const updateBreadcrumbStore = () => {
        BreadcrumbStore.update((bs) => {
            let newList = [
                {
                    label: 'Alerts',
                    path: '/alerts/overview/open-alerts',
                    active: false,
                },
                {
                    label: `${reqType === 'create' ? `Create` : `Edit`} Alert`,
                    path: '/alerts/overview/alert/create',
                    active: true,
                },
            ];
            bs.items = newList;
        });
        ComponentStore.update((s) => {
            s.parent = 'alerts';
        });
    };

    useEffect(() => {
        updateBreadcrumbStore();
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        const handleBeforeUnload = (event) => {
            event.preventDefault();
            event.returnValue = '';
            alert('Are you sure you want to reload the page? Changes you have made wont be saved.');
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);

    useEffect(() => {
        if (alertId) getConfiguredAlertById(alertId);
    }, [alertId]);

    return (
        <React.Fragment>
            <Row>
                <Col lg={12}>
                    <CreateAlertHeader
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                        isAlertConfigured={isTargetConfigured && isConditionConfigured && isAlertNameSet}
                        onAlertCreate={() => {
                            handleCreateAlert(alertObj);
                        }}
                        reqType={reqType}
                        isCreatingAlert={isCreatingAlert}
                        renderAlertCondition={renderAlertCondition}
                        alertObj={alertObj}
                    />
                </Col>
            </Row>

            <div className="custom-padding">
                {activeTab === 0 && (
                    <ConfigureAlerts
                        alertObj={alertObj}
                        handleTargetChange={handleTargetChange}
                        originalBldgsList={originalBldgsList}
                        originalEquipsList={originalEquipsList}
                        handleRecurrenceChange={handleRecurrenceChange}
                        handleConditionChange={handleConditionChange}
                        setTypeSelectedLabel={setTypeSelectedLabel}
                        handleModalClick={handleModalClick}
                        openBldgConfigModel={openBldgConfigModel}
                        openEquipConfigModel={openEquipConfigModel}
                        setAlertObj={setAlertObj}
                        handleChange={handleChange}
                    />
                )}

                {activeTab === 1 && (
                    <NotificationSettings
                        alertObj={alertObj}
                        typeSelectedLabel={typeSelectedLabel}
                        handleConditionChange={handleConditionChange}
                        handleNotificationChange={handleNotificationChange}
                        handleRecurrenceChange={handleRecurrenceChange}
                    />
                )}
            </div>

            <BuildingConfig
                isModalOpen={showBldgConfigModal}
                handleModalClose={closeBldgConfigModel}
                alertObj={alertObj}
                handleTargetChange={handleTargetChange}
                setOriginalBldgsList={setOriginalBldgsList}
            />
            <EquipConfig
                isModalOpen={showEquipConfigModal}
                handleModalClose={closeEquipConfigModel}
                alertObj={alertObj}
                handleTargetChange={handleTargetChange}
            />
        </React.Fragment>
    );
};

export default AlertConfig;
