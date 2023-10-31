import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import { useHistory } from 'react-router-dom';
import Skeleton from 'react-loading-skeleton';
import { Row, Col, CardBody, CardHeader } from 'reactstrap';
import { UncontrolledTooltip } from 'reactstrap';

import Typography from '../../../sharedComponents/typography';
import { Button } from '../../../sharedComponents/button';
import Brick from '../../../sharedComponents/brick';
import Select from '../../../sharedComponents/form/select';
import Inputs from '../../../sharedComponents/form/input/Input';
import { Checkbox } from '../../../sharedComponents/form/checkbox';

import { BreadcrumbStore } from '../../../store/BreadcrumbStore';
import { ComponentStore } from '../../../store/ComponentStore';

import { ReactComponent as DeleteSVG } from '../../../assets/icon/delete.svg';
import { ReactComponent as KWH_SVG } from '../../../assets/icon/kwh.svg';
import { ReactComponent as BanSVG } from '../../../assets/icon/ban.svg';
import { ReactComponent as PenSVG } from '../../../assets/icon/panels/pen.svg';
import { ReactComponent as CheckMarkSVG } from '../../../assets/icon/check-mark.svg';
import { ReactComponent as TooltipIcon } from '../../../sharedComponents/assets/icons/tooltip.svg';
import { ReactComponent as UserProfileSVG } from '../../../assets/icon/user-profile.svg';
import { ReactComponent as BuildingTypeSVG } from '../../../sharedComponents/assets/icons/building-type.svg';
import { ReactComponent as EquipmentTypeSVG } from '../../../sharedComponents/assets/icons/equipment-icon.svg';
import { ReactComponent as EmailAddressSVG } from '../../../sharedComponents/assets/icons/email-address-icon.svg';

import { fetchBuildingsList } from '../../../services/buildings';
import { getAllBuildingTypes } from '../../settings/general-settings/services';

import {
    alertConditions,
    conditionLevelsList,
    defaultAlertObj,
    defaultConditionObj,
    filtersForEnergyConsumption,
} from './constants';

import colorPalette from '../../../assets/scss/_colors.scss';
import './styles.scss';

const TargetToolTip = () => {
    return (
        <div>
            <UncontrolledTooltip placement="bottom" target={'tooltip-for-target'}>
                {`Target Tooltip.`}
            </UncontrolledTooltip>

            <button type="button" className="tooltip-button" id={'tooltip-for-target'}>
                <TooltipIcon className="tooltip-icon" />
            </button>
        </div>
    );
};

const ConditionToolTip = () => {
    return (
        <div>
            <UncontrolledTooltip placement="bottom" target={'tooltip-for-condition'}>
                {`Condition Tooltip.`}
            </UncontrolledTooltip>

            <button type="button" className="tooltip-button" id={'tooltip-for-condition'}>
                <TooltipIcon className="tooltip-icon" />
            </button>
        </div>
    );
};

const CreateAlertHeader = (props) => {
    const { activeTab, setActiveTab, isAlertConfigured = false } = props;

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
                            onClick={() => {
                                alert('Alert created.');
                            }}
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
    const { alertObj = {}, handleTargetChange, handleConditionChange, updateAlertWithBuildingData } = props;

    console.log('SSR alertObj => ', alertObj);

    const [targetType, setTargetType] = useState('');
    const [isFetchingData, setFetching] = useState(false);

    const [originalBuildingList, setOriginalBuildingsList] = useState([]); // Fetched from backend
    const [buildingsList, setBuildingsList] = useState([]);
    const [buildingTypeList, setBuildingTypeList] = useState([]);

    const [equipmentsList, setEquipmentsList] = useState([]);
    const [equipmentTypeList, setEquipmentTypeList] = useState([]);

    const handleBldgTypeListUpdate = (newBldgTypeList = [], originalBldgList) => {
        let newBldgList = [];
        if (newBldgTypeList.length !== 0) {
            originalBldgList.forEach((bldgObj) => {
                const isExist = newBldgTypeList.some((bldgTypeObj) => bldgTypeObj?.value === bldgObj?.building_type_id);
                if (isExist) newBldgList.push(bldgObj);
            });
        }
        setBuildingsList(newBldgList);
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
        if (targetType === 'building') {
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

                            updateAlertWithBuildingData(newMappedBuildingTypesData, newMappedBldgsData);
                        }
                    }
                })
                .catch(() => {})
                .finally(() => {
                    setFetching(false);
                });
        }
    }, [targetType]);

    return (
        <>
            <Row>
                <Col lg={9}>
                    <div className="custom-card">
                        <CardHeader>
                            <div className="d-flex align-items-baseline">
                                <Typography.Subheader
                                    size={Typography.Sizes.md}
                                    style={{ color: colorPalette.primaryGray550 }}>
                                    {`Target`}
                                </Typography.Subheader>
                                <TargetToolTip />
                            </div>
                        </CardHeader>
                        <CardBody>
                            {alertObj?.target?.submitted ? (
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <Typography.Subheader
                                            size={Typography.Sizes.md}>{`Building`}</Typography.Subheader>
                                        <Brick sizeInRem={0.25} />
                                        <Typography.Body size={Typography.Sizes.md} className="text-muted">
                                            {renderTargetedBuildingsList(alertObj, buildingsList)}
                                        </Typography.Body>
                                    </div>
                                    <div>
                                        <PenSVG
                                            className="mouse-pointer"
                                            width={17}
                                            height={17}
                                            onClick={() => {
                                                handleTargetChange('submitted', !alertObj?.target?.submitted);
                                            }}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div>
                                        <Typography.Subheader size={Typography.Sizes.md}>
                                            {`Select a Target Type`}
                                        </Typography.Subheader>

                                        <Brick sizeInRem={1.25} />

                                        <div className="d-flex" style={{ gap: '0.75rem' }}>
                                            <div
                                                className={`d-flex align-items-center mouse-pointer ${
                                                    alertObj?.target?.type === 'building'
                                                        ? `target-type-container-active`
                                                        : `target-type-container`
                                                }`}
                                                onClick={() => {
                                                    setTargetType('building');
                                                    handleTargetChange('type', 'building');
                                                }}>
                                                <BuildingTypeSVG className="p-0 square" width={20} height={20} />
                                                <Typography.Subheader
                                                    size={Typography.Sizes.md}
                                                    style={{ color: colorPalette.primaryGray700 }}>
                                                    {`Building`}
                                                </Typography.Subheader>
                                            </div>

                                            <div
                                                className={`d-flex align-items-center mouse-pointer ${
                                                    alertObj?.target?.type === 'equipment'
                                                        ? `target-type-container-active`
                                                        : `target-type-container`
                                                }`}
                                                onClick={() => {
                                                    setTargetType('equipment');
                                                    handleTargetChange('type', 'equipment');
                                                }}>
                                                <EquipmentTypeSVG className="p-0 square" width={20} height={20} />
                                                <Typography.Subheader
                                                    size={Typography.Sizes.md}
                                                    style={{ color: colorPalette.primaryGray700 }}>
                                                    {`Equipment`}
                                                </Typography.Subheader>
                                            </div>
                                        </div>
                                    </div>

                                    {alertObj?.target?.type && <hr />}

                                    {alertObj?.target?.type === 'building' && (
                                        <div>
                                            <Typography.Subheader size={Typography.Sizes.md}>
                                                {`Select a Target`}
                                            </Typography.Subheader>

                                            <Brick sizeInRem={1.25} />

                                            {isFetchingData ? (
                                                <Skeleton count={2} width={1000} height={20} />
                                            ) : (
                                                <div className="d-flex w-100 justify-content-between">
                                                    <div className="d-flex w-75" style={{ gap: '0.75rem' }}>
                                                        <div className="w-100">
                                                            <Typography.Body size={Typography.Sizes.sm}>
                                                                {`Building Type`}
                                                            </Typography.Body>
                                                            <Brick sizeInRem={0.25} />
                                                            <Select.Multi
                                                                id="endUseSelect"
                                                                placeholder="Select Building Type"
                                                                name="select"
                                                                className="w-100"
                                                                isSearchable={true}
                                                                options={buildingTypeList}
                                                                onChange={(newBldgTypeList) => {
                                                                    handleTargetChange('lists', []);
                                                                    handleBldgTypeListUpdate(
                                                                        newBldgTypeList,
                                                                        originalBuildingList
                                                                    );
                                                                    handleTargetChange('typesList', newBldgTypeList);
                                                                }}
                                                                value={alertObj?.target?.typesList ?? []}
                                                                menuPlacement="auto"
                                                            />
                                                        </div>

                                                        <div className="w-100">
                                                            <Typography.Body size={Typography.Sizes.sm}>
                                                                {`Building`}
                                                            </Typography.Body>
                                                            <Brick sizeInRem={0.25} />
                                                            <Select.Multi
                                                                id="endUseSelect"
                                                                placeholder="Select Building"
                                                                name="select"
                                                                className="w-100"
                                                                isSearchable={true}
                                                                options={buildingsList}
                                                                onChange={(selectedBldgTypeList) => {
                                                                    handleTargetChange('lists', selectedBldgTypeList);
                                                                }}
                                                                value={alertObj?.target?.lists ?? []}
                                                                menuPlacement="auto"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <Brick sizeInRem={1.35} />
                                                        <div
                                                            className="d-flex"
                                                            style={{
                                                                gap: '0.5rem',
                                                                maxHeight: '2.25rem',
                                                            }}>
                                                            <Button
                                                                label={'Cancel'}
                                                                size={Button.Sizes.md}
                                                                type={Button.Type.secondaryGrey}
                                                                className="w-100"
                                                                onClick={() => {
                                                                    handleTargetChange(
                                                                        'submitted',
                                                                        !alertObj?.target.submitted
                                                                    );
                                                                }}
                                                                disabled={
                                                                    alertObj?.target?.lists.length === 0 ||
                                                                    alertObj?.target?.typesList.length === 0
                                                                }
                                                            />
                                                            <Button
                                                                label={'Add target'}
                                                                size={Button.Sizes.md}
                                                                type={Button.Type.primary}
                                                                className="w-100"
                                                                onClick={() => {
                                                                    handleTargetChange(
                                                                        'submitted',
                                                                        !alertObj?.target.submitted
                                                                    );
                                                                }}
                                                                disabled={
                                                                    alertObj?.target?.lists &&
                                                                    alertObj?.target?.lists.length === 0
                                                                }
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {alertObj?.alertType === 'equipment' && (
                                        <div>
                                            <Typography.Subheader size={Typography.Sizes.md}>
                                                {`Select a Target`}
                                            </Typography.Subheader>

                                            <Brick sizeInRem={1.25} />

                                            <Select
                                                id="endUseSelect"
                                                placeholder="Select Building"
                                                name="select"
                                                isSearchable={true}
                                                options={[]}
                                                className="w-25"
                                                menuPlacement="auto"
                                            />

                                            <Brick sizeInRem={1.25} />

                                            <div
                                                className="d-flex justify-content-between w-100"
                                                style={{ gap: '1.25rem' }}>
                                                <div className="d-flex w-75" style={{ gap: '0.75rem' }}>
                                                    <Select
                                                        id="endUseSelect"
                                                        placeholder="Select Equipment Type"
                                                        name="select"
                                                        isSearchable={true}
                                                        options={[]}
                                                        className="w-100"
                                                        menuPlacement="auto"
                                                    />

                                                    <Select
                                                        id="endUseSelect"
                                                        placeholder="Select Equipment"
                                                        name="select"
                                                        isSearchable={true}
                                                        options={[]}
                                                        className="w-100"
                                                        menuPlacement="auto"
                                                    />
                                                </div>

                                                <div className="d-flex" style={{ gap: '0.75rem' }}>
                                                    <Button
                                                        label={'Cancel'}
                                                        size={Button.Sizes.md}
                                                        type={Button.Type.secondaryGrey}
                                                        className="w-100"
                                                    />
                                                    <Button
                                                        label={'Add target'}
                                                        size={Button.Sizes.md}
                                                        type={Button.Type.primary}
                                                        className="w-100"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </CardBody>
                    </div>
                </Col>
            </Row>

            <Brick sizeInRem={2} />

            <Row>
                <Col lg={9}>
                    <div className="custom-card">
                        <CardHeader>
                            <div className="d-flex align-items-baseline">
                                <Typography.Subheader
                                    size={Typography.Sizes.md}
                                    style={{ color: colorPalette.primaryGray550 }}>
                                    {`Condition`}
                                </Typography.Subheader>
                                <ConditionToolTip />
                            </div>
                        </CardHeader>
                        <CardBody>
                            <div>
                                <Typography.Subheader size={Typography.Sizes.md}>
                                    {`Select a Condition`}
                                </Typography.Subheader>

                                <Brick sizeInRem={1.25} />

                                {/* <div className="d-flex w-100 align-items-center" style={{ gap: '0.75rem' }}> */}
                                <div
                                    className={`container-grid${
                                        alertObj?.condition?.filterType === `number` ? `-with-value` : ``
                                    }`}>
                                    <Select
                                        id="endUseSelect"
                                        placeholder="Select a Condition"
                                        name="select"
                                        options={alertObj?.target?.type === '' ? [] : alertConditions}
                                        className="w-100"
                                        onChange={(e) => {
                                            handleConditionChange('type', e.value);
                                        }}
                                        currentValue={alertConditions.filter(
                                            (option) => option.value === alertObj?.condition?.type
                                        )}
                                        isDisabled={alertObj?.target?.type === ''}
                                        menuPlacement="auto"
                                    />

                                    {alertObj?.target?.type !== '' && (
                                        <>
                                            <Select
                                                id="condition_lvl"
                                                name="select"
                                                options={conditionLevelsList}
                                                className="w-100"
                                                onChange={(e) => {
                                                    handleConditionChange('level', e.value);
                                                }}
                                                currentValue={conditionLevelsList.filter(
                                                    (option) => option.value === alertObj?.condition?.level
                                                )}
                                                menuPlacement="auto"
                                            />
                                            <Select
                                                id="filter_type"
                                                name="select"
                                                options={filtersForEnergyConsumption}
                                                className="w-100"
                                                onChange={(e) => {
                                                    handleConditionChange('filterType', e.value);
                                                }}
                                                currentValue={filtersForEnergyConsumption.filter(
                                                    (option) => option.value === alertObj?.condition?.filterType
                                                )}
                                                menuPlacement="auto"
                                            />
                                            {alertObj?.condition?.filterType === 'number' && (
                                                <Inputs
                                                    type="number"
                                                    placeholder="Enter value"
                                                    className="custom-input-width w-100"
                                                    inputClassName="custom-input-field"
                                                    value={alertObj?.condition?.thresholdValue}
                                                    onChange={(e) => {
                                                        handleConditionChange('thresholdValue', e.target.value);
                                                    }}
                                                    elementEnd={<KWH_SVG />}
                                                />
                                            )}
                                        </>
                                    )}
                                </div>

                                {alertObj?.condition?.filterType !== 'number' && (
                                    <>
                                        <Brick sizeInRem={1.25} />

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
                                                        const value = e.target.value;
                                                        if (value === 'false')
                                                            handleConditionChange('threshold50', true);

                                                        if (value === 'true')
                                                            handleConditionChange('threshold50', false);
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
                                                        const value = e.target.value;
                                                        if (value === 'false')
                                                            handleConditionChange('threshold75', true);

                                                        if (value === 'true')
                                                            handleConditionChange('threshold75', false);
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
                                                    const value = e.target.value;
                                                    if (value === 'false') handleConditionChange('threshold90', true);
                                                    if (value === 'true') handleConditionChange('threshold90', false);
                                                }}
                                            />
                                        )}
                                    </>
                                )}
                            </div>
                        </CardBody>
                    </div>
                </Col>
            </Row>

            <Brick sizeInRem={2} />
        </>
    );
};

const NotificationSettings = (props) => {
    const { notifyType, setNotifyType } = props;

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
                                <Typography.Body
                                    size={Typography.Sizes.md}
                                    className="text-muted">{`Building`}</Typography.Body>
                            </div>

                            <Brick sizeInRem={1} />

                            <div>
                                <Typography.Subheader size={Typography.Sizes.md}>{`Building`}</Typography.Subheader>
                                <Brick sizeInRem={0.25} />
                                <Typography.Body size={Typography.Sizes.md} className="text-muted">
                                    {`123 Main St. Portland, OR`}
                                </Typography.Body>
                            </div>

                            <Brick sizeInRem={1} />

                            <div>
                                <Typography.Subheader size={Typography.Sizes.md}>{`Condition`}</Typography.Subheader>
                                <Brick sizeInRem={0.25} />
                                <Typography.Body
                                    size={Typography.Sizes.md}
                                    className="text-muted">{`Energy consumption for the month is above 75% of 10,000 kWh `}</Typography.Body>
                            </div>
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
                    <Typography.Body
                        size={
                            Typography.Sizes.md
                        }>{`These are all notification methods available given your selected target and condition.`}</Typography.Body>
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
                                        notifyType === 'none' ? `notify-container-active` : `notify-container`
                                    }`}
                                    onClick={() => setNotifyType('none')}>
                                    <BanSVG className="p-0 square" width={20} height={20} />
                                    <Typography.Subheader
                                        size={Typography.Sizes.md}
                                        style={{ color: colorPalette.primaryGray700 }}>
                                        {`None`}
                                    </Typography.Subheader>
                                </div>

                                <div
                                    className={`d-flex align-items-center mouse-pointer ${
                                        notifyType === 'user' ? `notify-container-active` : `notify-container`
                                    }`}
                                    onClick={() => setNotifyType('user')}>
                                    <UserProfileSVG className="p-0 square" width={18} height={18} />
                                    <Typography.Subheader
                                        size={Typography.Sizes.md}
                                        style={{ color: colorPalette.primaryGray700 }}>
                                        {`User`}
                                    </Typography.Subheader>
                                </div>

                                <div
                                    className={`d-flex align-items-center mouse-pointer ${
                                        notifyType === 'email' ? `notify-container-active` : `notify-container`
                                    }`}
                                    onClick={() => setNotifyType('email')}>
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
    const [notifyType, setNotifyType] = useState('none');
    const [alertObj, setAlertObj] = useState(defaultAlertObj);

    const handleTargetChange = (key, value) => {
        let obj = Object.assign({}, alertObj);
        // if (key === 'type') obj = _.cloneDeep(defaultAlertObj);
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

    const updateAlertWithBuildingData = (bldg_type_list, bldgs_list) => {
        let obj = Object.assign({}, alertObj);
        obj.target.typesList = bldg_type_list ?? [];
        obj.target.lists = bldgs_list ?? [];
        setAlertObj(obj);
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
            (alertObj?.condition?.filterType !== 'number' &&
                (alertObj?.condition?.threshold50 ||
                    alertObj?.condition?.threshold75 ||
                    alertObj?.condition?.threshold90)));

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
                    />
                )}
                {activeTab === 1 && <NotificationSettings notifyType={notifyType} setNotifyType={setNotifyType} />}
            </div>
        </React.Fragment>
    );
};

export default AddAlerts;
