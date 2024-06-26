import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import Modal from 'react-bootstrap/Modal';
import Brick from '../../../sharedComponents/brick';
import InputTooltip from '../../../sharedComponents/form/input/InputTooltip';
import Typography from '../../../sharedComponents/typography';
import colorPalette from '../../../assets/scss/_colors.scss';
import Select from '../../../sharedComponents/form/select';
import { Button } from '../../../sharedComponents/button';
import { getSensorsCts, updateSensorData } from './services';
import { UserStore } from '../../../store/UserStore';
import { compareObjData } from '../../../helpers/helpers';
import './styles.scss';

const EditSensorModal = (props) => {
    const { showModal, closeModal, currentSensorObj, fetchPassiveDeviceSensorData } = props;
    const [errorObj, setErrorObj] = useState(null);
    const [isProcessing, setProcessing] = useState(false);

    const [ctSensorObj, setCTSensorObj] = useState(null);
    const [originalCTSensorObj, setOriginalCTSensorObj] = useState(null);
    const [ctSensorsList, setCTSensorsList] = useState([]);

    const handleChange = (key, value, sensorsList) => {
        let obj = Object.assign({}, ctSensorObj);
        let newErrorObj = Object.assign({}, errorObj);

        if (key === '_id') {
            let newObj = sensorsList.find((el) => el?._id === value);
            obj = newObj;
            if (newObj?.model === 'Custom') {
                obj.rated_amps = 0;
                obj.amp_multiplier = 0;
            }
        }

        obj[key] = value;
        setCTSensorObj(obj);
        setErrorObj(newErrorObj);
    };

    const handleCustomValueChange = (ct_sensors) => {
        const customObj = ct_sensors.find((el) => el?.model === 'Custom');
        handleChange('_id', customObj?._id);
    };

    const saveSensorData = async (sensor_id, ct_obj) => {
        if (!sensor_id || !ct_obj?._id) return;

        const alertObj = Object.assign({}, errorObj);
        if (ct_obj?.model === 'Custom') {
            if (ct_obj?.rated_amps === undefined || ct_obj?.rated_amps === '') {
                alertObj.rated_amps = 'Please enter amp rating value. It cannot be empty.';
            }

            if (ct_obj?.amp_multiplier === undefined || ct_obj?.amp_multiplier === '') {
                alertObj.amp_multiplier = 'Please enter multiplier value. It cannot be empty.';
            }
        }
        setErrorObj(alertObj);

        if (alertObj.rated_amps || alertObj.amp_multiplier) return;

        setProcessing(true);

        const params = `?sensor_id=${sensor_id}`;
        const payload = {};

        payload.sensor_model_id = ct_obj?._id;

        if (ct_obj?.model === 'Custom') {
            payload.rated_amps = parseFloat(ct_obj?.rated_amps);
            payload.amp_multiplier = parseFloat(ct_obj?.amp_multiplier);
        }

        await updateSensorData(params, payload)
            .then((res) => {
                if (res?.status === 200) {
                    fetchPassiveDeviceSensorData();
                    UserStore.update((s) => {
                        s.showNotification = true;
                        s.notificationMessage = 'Sensor updated successfully.';
                        s.notificationType = 'success';
                    });
                } else {
                    UserStore.update((s) => {
                        s.showNotification = true;
                        s.notificationMessage = 'Unable to update sensor due to internal server error.';
                        s.notificationType = 'error';
                    });
                }
            })
            .catch(() => {
                UserStore.update((s) => {
                    s.showNotification = true;
                    s.notificationMessage = 'Unable to update Sensor.';
                    s.notificationType = 'error';
                });
            })
            .finally(() => {
                closeModal();
                setProcessing(false);
                setErrorObj(null);
                setCTSensorObj(null);
                setCTSensorsList([]);
            });
    };

    const fetchCTSList = async () => {
        await getSensorsCts()
            .then((res) => {
                const response = res?.data;
                if (response?.success && response?.data.length !== 0) {
                    // const customObj = response?.data.find((el) => el?.model === 'Custom'); --- PLT-1562 Hide "Custom" CT functionality temperory
                    const sortedList = _.chain(response?.data)
                        .filter((el) => el?.model !== 'Custom')
                        .sortBy((el) => el?.model)
                        .map((el) => ({
                            ...el,
                            label: el?.model,
                            value: el?._id,
                        }))
                        .value();
                    // sortedList.push(customObj); //  PLT-1562 Hide "Custom" CT functionality temperory
                    setCTSensorsList(sortedList);
                }
            })
            .catch(() => {});
    };

    useEffect(() => {
        if (showModal) fetchCTSList();
    }, [showModal]);

    useEffect(() => {
        if (currentSensorObj?.sensor_model_id && ctSensorsList.length !== 0) {
            if (currentSensorObj?.is_custom_model) {
                const obj = ctSensorsList.find((el) => el?.value === currentSensorObj?.sensor_model_id);
                if (obj?.model === 'Custom') {
                    obj.rated_amps = currentSensorObj?.rated_amps;
                    obj.amp_multiplier = currentSensorObj?.amp_multiplier;
                }
                setCTSensorObj(obj);
                setOriginalCTSensorObj(obj);
            } else {
                const obj = ctSensorsList.find((el) => el?.value === currentSensorObj?.sensor_model_id);
                setCTSensorObj(obj);
                setOriginalCTSensorObj(obj);
            }
        }
    }, [ctSensorsList, currentSensorObj]);

    return (
        <Modal show={showModal} onHide={closeModal} backdrop="static" size={'md'} keyboard={false} centered>
            <div className="p-4">
                <Typography.Header size={Typography.Sizes.lg}>Edit Sensor</Typography.Header>

                <Brick sizeInRem={2} />

                <div className="w-100 mr-2">
                    <Typography.Body size={Typography.Sizes.md}>Sensor</Typography.Body>
                    <Brick sizeInRem={0.25} />
                    <Select
                        placeholder="Select Sensor Model"
                        options={ctSensorsList}
                        currentValue={ctSensorsList.find((option) => option?.value === ctSensorObj?._id)}
                        onChange={(e) => handleChange('_id', e.value, ctSensorsList)}
                        isSearchable={false}
                    />
                </div>

                <Brick sizeInRem={1.5} />

                {/* --- PLT-1562 Hide "Custom" CT functionality temperory */}
                {/* {ctSensorObj?.model === 'Custom' ? (
                    <Brick sizeInRem={1.5} />
                ) : (
                    <>
                        <Brick sizeInRem={0.25} />
                        <div
                            className="mouse-pointer float-right mr-1"
                            onClick={() => handleCustomValueChange(ctSensorsList)}>
                            {!(ctSensorObj?.model === 'Custom') && (
                                <Typography.Body
                                    size={Typography.Sizes.xs}
                                    className="input-error-label text-primary font-bold">
                                    {`Set Custom Value`}
                                </Typography.Body>
                            )}
                        </div>
                        <Brick sizeInRem={1.25} />
                    </>
                )} */}

                <div className="w-100 mr-2">
                    <Typography.Body size={Typography.Sizes.md}>
                        {`Amp Rating`}
                        {ctSensorObj?.model === 'Custom' && (
                            <span style={{ color: colorPalette.error600 }} className="font-weight-bold ml-1">
                                *
                            </span>
                        )}
                    </Typography.Body>

                    <Brick sizeInRem={0.25} />
                    <InputTooltip
                        type="number"
                        placeholder={'Enter Amp Rating'}
                        onChange={(e) => {
                            if (e.target.value < 0) return;
                            handleChange('rated_amps', e.target.value);
                        }}
                        labelSize={Typography.Sizes.md}
                        value={ctSensorObj?.rated_amps}
                        disabled={!(ctSensorObj?.model === 'Custom')}
                        error={errorObj?.rated_amps}
                        inputClassName={'custom-input-field'}
                    />
                </div>

                <Brick sizeInRem={1.5} />

                <div className="w-100">
                    <div>
                        <Typography.Body size={Typography.Sizes.md}>
                            {`Multiplier`}
                            {ctSensorObj?.model === 'Custom' && (
                                <span style={{ color: colorPalette.error600 }} className="font-weight-bold ml-1">
                                    *
                                </span>
                            )}
                        </Typography.Body>

                        <Brick sizeInRem={0.25} />
                        <InputTooltip
                            type="number"
                            placeholder={'Enter Multiplier'}
                            onChange={(e) => {
                                if (e.target.value < 0) return;
                                handleChange('amp_multiplier', e.target.value);
                            }}
                            labelSize={Typography.Sizes.md}
                            value={ctSensorObj?.amp_multiplier}
                            disabled={!(ctSensorObj?.model === 'Custom')}
                            error={errorObj?.amp_multiplier}
                            inputClassName={'custom-input-field'}
                        />
                    </div>
                </div>

                <Brick sizeInRem={2.5} />

                <div className="d-flex justify-content-between w-100">
                    <Button
                        label="Cancel"
                        size={Button.Sizes.lg}
                        type={Button.Type.secondaryGrey}
                        className="w-100"
                        onClick={() => {
                            closeModal();
                            setErrorObj(null);
                            setCTSensorObj(null);
                            setOriginalCTSensorObj(null);
                        }}
                    />

                    <Button
                        label={isProcessing ? 'Saving ...' : 'Save'}
                        size={Button.Sizes.lg}
                        type={Button.Type.primary}
                        className="w-100"
                        disabled={isProcessing || compareObjData(ctSensorObj, originalCTSensorObj)}
                        onClick={() => saveSensorData(currentSensorObj?.id, ctSensorObj)}
                    />
                </div>

                <Brick sizeInRem={1} />
            </div>
        </Modal>
    );
};

export default EditSensorModal;
