import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import Skeleton from 'react-loading-skeleton';
import { CardBody, CardHeader, UncontrolledTooltip } from 'reactstrap';

import Typography from '../../../sharedComponents/typography';
import { Button } from '../../../sharedComponents/button';
import Brick from '../../../sharedComponents/brick';
import Select from '../../../sharedComponents/form/select';

import { ReactComponent as PenSVG } from '../../../assets/icon/panels/pen.svg';
import { ReactComponent as BuildingTypeSVG } from '../../../sharedComponents/assets/icons/building-type.svg';
import { ReactComponent as EquipmentTypeSVG } from '../../../sharedComponents/assets/icons/equipment-icon.svg';
import { ReactComponent as TooltipIcon } from '../../../sharedComponents/assets/icons/tooltip.svg';

import { defaultDropdownSearch, filterOutSelectAllOption } from '../../../sharedComponents/form/select/helpers';

import { TARGET_TYPES } from '../constants';
import colorPalette from '../../../assets/scss/_colors.scss';
import './styles.scss';

const TargetToolTip = () => {
    return (
        <div>
            <UncontrolledTooltip placement="bottom" target="tooltip-for-target">
                {`Target Tooltip.`}
            </UncontrolledTooltip>

            <button type="button" className="tooltip-button" id="tooltip-for-target">
                <TooltipIcon className="tooltip-icon" />
            </button>
        </div>
    );
};

const Target = (props) => {
    const {
        alertObj = {},
        isFetchingData,
        isFetchingEquipments,
        handleTargetChange,
        renderTargetedBuildingsList,
        renderTargetTypeHeader,
        buildingsList = [],
        equipmentTypeList = [],
        equipmentsList = [],
        setEquipmentsList,
        setOriginalEquipmentsList,
        originalBuildingsList = [],
        originalEquipmentsList = [],
        buildingTypeList,
        filteredBuildingsList,
        setBuildingsList,
        fetchAllEquipmentsList,
        handleEquipmentListChange,
        handleModalClick,
        openBldgConfigModel,
        openEquipConfigModel,
    } = props;

    const [selectedBldgsForEquip, setSelectedBldgsForEquip] = useState([]);

    useEffect(() => {
        if (alertObj?.target?.type !== TARGET_TYPES.EQUIPMENT && selectedBldgsForEquip.length !== 0) {
            setSelectedBldgsForEquip([]);
        }
    }, [alertObj?.target?.type]);

    return (
        <div className="custom-card">
            <CardHeader>
                <div className="d-flex align-items-baseline">
                    <Typography.Subheader size={Typography.Sizes.md} style={{ color: colorPalette.primaryGray550 }}>
                        {`Target`}
                    </Typography.Subheader>
                    <TargetToolTip />
                </div>
            </CardHeader>
            <CardBody>
                {alertObj?.target?.type && alertObj?.target?.lists.length !== 0 ? (
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <Typography.Subheader size={Typography.Sizes.md}>
                                {renderTargetTypeHeader(alertObj)}
                            </Typography.Subheader>
                            <Brick sizeInRem={0.25} />
                            <Typography.Body size={Typography.Sizes.md} className="text-muted">
                                {renderTargetedBuildingsList(alertObj, originalBuildingsList)}
                            </Typography.Body>
                        </div>
                        <div>
                            <PenSVG
                                className="mouse-pointer"
                                width={17}
                                height={17}
                                onClick={() => {
                                    if (alertObj?.target?.type === TARGET_TYPES.BUILDING) {
                                        openBldgConfigModel();
                                    } else if (alertObj?.target?.type === TARGET_TYPES.EQUIPMENT) {
                                        openEquipConfigModel();
                                    }
                                    handleTargetChange('submitted', !alertObj?.target?.submitted);
                                }}
                            />
                        </div>
                    </div>
                ) : (
                    <div>
                        <Typography.Subheader size={Typography.Sizes.md}>{`Select a Target Type`}</Typography.Subheader>
                        <Brick sizeInRem={1.25} />

                        <div className="d-flex" style={{ gap: '0.75rem' }}>
                            {/* Buidling */}
                            <div
                                id={TARGET_TYPES.BUILDING}
                                className={`d-flex align-items-center mouse-pointer ${
                                    alertObj?.target?.type === TARGET_TYPES.BUILDING
                                        ? `target-type-container-active`
                                        : `target-type-container`
                                }`}
                                onClick={(e) => {
                                    handleModalClick(e.currentTarget.id);
                                    handleTargetChange('type', TARGET_TYPES.BUILDING);
                                }}>
                                <BuildingTypeSVG className="p-0 square" width={20} height={20} />
                                <Typography.Subheader
                                    size={Typography.Sizes.md}
                                    style={{ color: colorPalette.primaryGray700 }}>
                                    Building
                                </Typography.Subheader>
                            </div>

                            {/* Equipment */}
                            <div
                                id={TARGET_TYPES.EQUIPMENT}
                                className={`d-flex align-items-center mouse-pointer ${
                                    alertObj?.target?.type === TARGET_TYPES.EQUIPMENT
                                        ? `target-type-container-active`
                                        : `target-type-container`
                                }`}
                                onClick={(e) => {
                                    handleModalClick(e.currentTarget.id);
                                    handleTargetChange('type', TARGET_TYPES.EQUIPMENT);
                                }}>
                                <EquipmentTypeSVG className="p-0 square" width={20} height={20} />
                                <Typography.Subheader
                                    size={Typography.Sizes.md}
                                    style={{ color: colorPalette.primaryGray700 }}>
                                    Equipment
                                </Typography.Subheader>
                            </div>
                        </div>
                    </div>
                )}
            </CardBody>
        </div>
    );
};

export default Target;
