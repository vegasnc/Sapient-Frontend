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
                {alertObj?.target?.submitted ? (
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
                                        alertObj?.target?.type === TARGET_TYPES.BUILDING
                                            ? `target-type-container-active`
                                            : `target-type-container`
                                    }`}
                                    onClick={() => {
                                        !(isFetchingData || isFetchingEquipments) &&
                                            handleTargetChange('type', TARGET_TYPES.BUILDING);
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
                                        alertObj?.target?.type === TARGET_TYPES.EQUIPMENT
                                            ? `target-type-container-active`
                                            : `target-type-container`
                                    }`}
                                    onClick={() => {
                                        !(isFetchingData || isFetchingEquipments) &&
                                            handleTargetChange('type', TARGET_TYPES.EQUIPMENT);
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

                        {alertObj?.target?.type && (
                            <>
                                <Typography.Subheader size={Typography.Sizes.md}>
                                    {`Select a Target`}
                                </Typography.Subheader>

                                <Brick sizeInRem={1.25} />
                            </>
                        )}

                        {alertObj?.target?.type === TARGET_TYPES.BUILDING && (
                            <div>
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
                                                    isSelectAll={buildingTypeList && buildingTypeList.length !== 0}
                                                    options={buildingTypeList}
                                                    onChange={(newBldgTypeList) => {
                                                        const values = filterOutSelectAllOption(newBldgTypeList);
                                                        handleTargetChange('lists', []);
                                                        setBuildingsList(
                                                            filteredBuildingsList(values, originalBuildingsList)
                                                        );
                                                        handleTargetChange('typesList', values);
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
                                                    isSelectAll={buildingsList && buildingsList.length !== 0}
                                                    options={buildingsList}
                                                    onChange={(selectedBldgTypeList) => {
                                                        handleTargetChange(
                                                            'lists',
                                                            filterOutSelectAllOption(selectedBldgTypeList)
                                                        );
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
                                                        handleTargetChange('submitted', !alertObj?.target.submitted);
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
                                                        handleTargetChange('submitted', !alertObj?.target?.submitted);
                                                    }}
                                                    disabled={
                                                        alertObj?.target?.lists && alertObj?.target?.lists.length === 0
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {alertObj?.target?.type === TARGET_TYPES.EQUIPMENT && (
                            <div>
                                {isFetchingData ? (
                                    <Skeleton count={2} width={1000} height={20} />
                                ) : (
                                    <div>
                                        <div className="w-25">
                                            <Typography.Body size={Typography.Sizes.sm}>{`Building`}</Typography.Body>
                                            <Brick sizeInRem={0.25} />
                                            <Select.Multi
                                                id="buildingSelectList"
                                                placeholder="Select Building"
                                                name="select"
                                                className="w-100"
                                                isSearchable={true}
                                                isSelectAll={
                                                    originalBuildingsList && originalBuildingsList.length !== 0
                                                }
                                                options={originalBuildingsList}
                                                onChange={setSelectedBldgsForEquip}
                                                onMenuClose={() => {
                                                    if (selectedBldgsForEquip.length !== 0) {
                                                        const filteredBldgsList =
                                                            filterOutSelectAllOption(selectedBldgsForEquip);
                                                        handleTargetChange('buildingIDs', filteredBldgsList);
                                                        if (filteredBldgsList.length === 0) {
                                                            setEquipmentsList([]);
                                                            setOriginalEquipmentsList([]);
                                                            handleTargetChange('lists', []);
                                                        } else {
                                                            fetchAllEquipmentsList(
                                                                filteredBldgsList,
                                                                alertObj?.target?.typesList
                                                            );
                                                        }
                                                    }
                                                }}
                                                value={alertObj?.target?.buildingIDs ?? []}
                                                menuPlacement="auto"
                                            />
                                        </div>

                                        <Brick sizeInRem={1.25} />

                                        <div
                                            className="d-flex justify-content-between w-100"
                                            style={{ gap: '1.25rem' }}>
                                            <div className="d-flex w-75" style={{ gap: '0.75rem' }}>
                                                <div className="w-100">
                                                    <Typography.Body
                                                        size={Typography.Sizes.sm}>{`Equipment Type`}</Typography.Body>
                                                    <Brick sizeInRem={0.25} />
                                                    <Select.Multi
                                                        id="equipTypeSelectList"
                                                        placeholder="Select Equipment Type"
                                                        name="select"
                                                        className="w-100"
                                                        isSearchable={true}
                                                        isSelectAll={
                                                            equipmentTypeList && equipmentTypeList.length !== 0
                                                        }
                                                        options={equipmentTypeList}
                                                        onChange={(value) => {
                                                            const filteredList = filterOutSelectAllOption(value);
                                                            handleTargetChange('typesList', filteredList);
                                                            handleEquipmentListChange(
                                                                originalEquipmentsList,
                                                                filteredList,
                                                                alertObj?.target?.buildingIDs
                                                            );
                                                        }}
                                                        customSearchCallback={({ data, query }) =>
                                                            defaultDropdownSearch(data, query?.value)
                                                        }
                                                        value={alertObj?.target?.typesList ?? []}
                                                        menuPlacement="auto"
                                                    />
                                                </div>

                                                <div className="w-100">
                                                    <Typography.Body
                                                        size={Typography.Sizes.sm}>{`Equipment`}</Typography.Body>
                                                    <Brick sizeInRem={0.25} />
                                                    {isFetchingEquipments ? (
                                                        <Skeleton count={1} height={33} width={350} />
                                                    ) : (
                                                        <Select.Multi
                                                            id="equipTypeSelectList"
                                                            placeholder="Select Equipment"
                                                            name="select"
                                                            className="w-100"
                                                            isSearchable={true}
                                                            isSelectAll={equipmentsList && equipmentsList.length !== 0}
                                                            options={equipmentsList}
                                                            onChange={(value) => {
                                                                handleTargetChange(
                                                                    'lists',
                                                                    filterOutSelectAllOption(value)
                                                                );
                                                            }}
                                                            customSearchCallback={({ data, query }) =>
                                                                defaultDropdownSearch(data, query?.value)
                                                            }
                                                            value={alertObj?.target?.lists ?? []}
                                                            menuPlacement="auto"
                                                        />
                                                    )}
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
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </CardBody>
        </div>
    );
};

export default Target;