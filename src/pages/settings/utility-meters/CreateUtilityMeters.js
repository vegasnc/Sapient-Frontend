import React, { useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Typography from '../../../sharedComponents/typography';
import Brick from '../../../sharedComponents/brick';
import { Button } from '../../../sharedComponents/button';
import InputTooltip from '../../../sharedComponents/form/input/InputTooltip';
import Select from '../../../sharedComponents/form/select';
import { useHistory } from 'react-router-dom';
import colorPalette from '../../../assets/scss/_colors.scss';
import { ReactComponent as PlusSVG } from '../../../assets/icon/plus.svg';
import { UTILITY_MONITOR, convertToAlphaNumeric, utilityMeterModel } from './utils';
import { UserStore } from '../../../store/UserStore';
import { createUtilityMeterServices } from './services';

const CreateUtilityMeters = (props) => {
    const { bldgId } = props;

    const history = useHistory();

    const defaultObj = {
        status: true,
        device_id: '',
        model: UTILITY_MONITOR.PULSE_COUNTER,
        model_name: 'Sapient Pulse',
        modbus: '',
    };

    const defaultError = {
        device_id: null,
        model: null,
        modbus: null,
    };

    const [modal, setModal] = useState(false);
    const handleModalOpen = () => setModal(true);
    const handleModalClose = () => setModal(false);

    const [utilityData, setUtilityData] = useState(defaultObj);
    const [utilityError, setUtilityError] = useState(defaultError);

    const [isProcessing, setIsProcessing] = useState(false);

    const handleChange = (key, value) => {
        let obj = Object.assign({}, utilityData);

        if (key === 'device_id') {
            let formattedValue = convertToAlphaNumeric(value);
            if (formattedValue.length > 12) return;
            formattedValue = formattedValue.replace(/..\B/g, '$&:');
            obj[key] = formattedValue;
        } else {
            obj[key] = value;
        }

        if (key === 'model') {
            let selectedObj = utilityMeterModel.find((el) => el?.value === value);
            obj.model_name = selectedObj?.label;
        }
        setUtilityData(obj);
    };

    const redirectUserToUtilityMeterPage = (deviceId) => {
        history.push({
            pathname: `/settings/utility-monitors/single/${bldgId}/${deviceId}`,
        });
    };

    const handleClose = () => {
        setIsProcessing(false);
        setUtilityData(defaultObj);
        setUtilityError(defaultError);
        handleModalClose();
    };

    const saveUtilityMeter = async () => {
        let alertObj = Object.assign({}, utilityError);

        let formattedDeviceId = convertToAlphaNumeric(utilityData?.device_id);
        if (formattedDeviceId.length < 12) {
            alertObj.device_id = 'Please enter 12 digit Device ID.';
        }
        if (utilityData?.model.length === 0) alertObj.model = { text: 'Please select Model.' };
        if (utilityData?.modbus.length === 0) alertObj.modbus = 'Please enter Modbus. It cannot be empty.';

        setUtilityError(alertObj);

        if (!alertObj.device_id && !alertObj.model && !alertObj.modbus) {
            setIsProcessing(true);
            const reqObj = {
                building_id: bldgId,
                device_type: utilityData?.model.includes(`shadow`) ? 'shadow meter' : utilityData?.model,
                model: utilityData?.model_name,
                deviceIdentifier: utilityData?.device_id,
                modbus_address: utilityData?.modbus,
            };
            await createUtilityMeterServices(reqObj)
                .then((res) => {
                    const response = res?.data;
                    if (response?.success) {
                        UserStore.update((s) => {
                            s.showNotification = true;
                            s.notificationMessage = response?.message;
                            s.notificationType = 'success';
                        });
                        if (response?.data?.device_id) {
                            handleClose();
                            redirectUserToUtilityMeterPage(response?.data?.device_id);
                        }
                    } else {
                        if (!response?.success && response?.message.includes('identifier already exists')) {
                            alertObj.device_id = 'Device ID with given name already exists.';
                            setUtilityError(alertObj);
                        } else {
                            UserStore.update((s) => {
                                s.showNotification = true;
                                s.notificationMessage = response?.message
                                    ? response?.message
                                    : res
                                    ? 'Unable to create Utility Monitor.'
                                    : 'Unable to create Utility Monitor due to Internal Server Error!.';
                                s.notificationType = 'error';
                            });
                        }
                    }
                    setIsProcessing(false);
                })
                .catch((e) => {
                    setIsProcessing(false);
                    handleClose();
                });
        }
    };

    return (
        <>
            <div className="d-flex">
                <Button
                    label={isProcessing ? 'Adding Utility Monitor ...' : 'Add Utility Monitor'}
                    size={Button.Sizes.md}
                    type={Button.Type.primary}
                    icon={<PlusSVG />}
                    disabled={isProcessing}
                    onClick={handleModalOpen}
                />
            </div>
            <Modal show={modal} onHide={handleModalClose} backdrop="static" keyboard={false} centered>
                <div className="p-4">
                    <Typography.Header size={Typography.Sizes.lg}>Add Utility Monitor</Typography.Header>

                    <Brick sizeInRem={2} />

                    <div>
                        <Typography.Body size={Typography.Sizes.md}>
                            Model
                            <span style={{ color: colorPalette.error600 }} className="font-weight-bold ml-1">
                                *
                            </span>
                        </Typography.Body>
                        <Brick sizeInRem={0.25} />
                        <Select
                            placeholder="Select Model"
                            options={utilityMeterModel}
                            defaultValue={utilityMeterModel.filter((option) => option.value === utilityData?.model)}
                            onChange={(e) => {
                                handleChange('model', e.value);
                                setUtilityError({ ...utilityError, model: null });
                            }}
                            error={utilityError?.model}
                            isSearchable={true}
                        />
                    </div>

                    <Brick sizeInRem={1.5} />

                    <div>
                        <Typography.Body size={Typography.Sizes.md}>
                            Device ID
                            <span style={{ color: colorPalette.error600 }} className="font-weight-bold ml-1">
                                *
                            </span>
                        </Typography.Body>
                        <Brick sizeInRem={0.25} />
                        <InputTooltip
                            placeholder="Enter Device ID"
                            onChange={(e) => {
                                handleChange('device_id', e.target.value.trim().toUpperCase());
                                setUtilityError({ ...utilityError, device_id: null });
                            }}
                            error={utilityError?.device_id}
                            labelSize={Typography.Sizes.md}
                            value={utilityData?.device_id}
                        />
                        <Brick sizeInRem={0.25} />
                        {!utilityError.device_id && (
                            <Typography.Body size={Typography.Sizes.sm}>Enter MAC address of A8810.</Typography.Body>
                        )}
                    </div>

                    <Brick sizeInRem={1.25} />

                    <div>
                        <Typography.Body size={Typography.Sizes.md}>
                            Modbus Address
                            <span style={{ color: colorPalette.error600 }} className="font-weight-bold ml-1">
                                *
                            </span>
                        </Typography.Body>
                        <Brick sizeInRem={0.25} />
                        <InputTooltip
                            placeholder="Enter Modbus Address"
                            type="number"
                            onChange={(e) => {
                                if (e.target.value < 0) return;
                                handleChange('modbus', e.target.value);
                                setUtilityError({ ...utilityError, modbus: null });
                            }}
                            error={utilityError?.modbus}
                            labelSize={Typography.Sizes.md}
                            value={utilityData?.modbus}
                            inputClassName={'custom-input-field'}
                        />
                    </div>

                    <Brick sizeInRem={2.5} />

                    <div className="d-flex justify-content-between w-100">
                        <Button
                            label="Cancel"
                            size={Button.Sizes.lg}
                            type={Button.Type.secondaryGrey}
                            className="w-100"
                            onClick={() => {
                                setUtilityData(defaultObj);
                                setUtilityError(defaultError);
                                handleModalClose();
                            }}
                        />

                        <Button
                            label={isProcessing ? 'Creating...' : 'Create'}
                            size={Button.Sizes.lg}
                            type={Button.Type.primary}
                            className="w-100"
                            disabled={isProcessing}
                            onClick={saveUtilityMeter}
                        />
                    </div>

                    <Brick sizeInRem={1} />
                </div>
            </Modal>
        </>
    );
};

export default CreateUtilityMeters;
