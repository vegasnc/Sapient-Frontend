import React, { useState, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import Typography from '../../../sharedComponents/typography';
import Brick from '../../../sharedComponents/brick';
import { Button } from '../../../sharedComponents/button';
import InputTooltip from '../../../sharedComponents/form/input/InputTooltip';
import { saveEquipTypeData, getEndUseData } from './services';
import Select from '../../../sharedComponents/form/select';
import { UserStore } from '../../../store/UserStore';
import colorPalette from '../../../assets/scss/_colors.scss';

const CreateEquipType = ({ isAddEquipTypeModalOpen, closeAddEquipTypeModal, fetchEquipTypeData, search }) => {
    const defaultEquipTypeObj = {
        is_active: true,
        name: '',
        end_use: '',
    };

    const [equipTypeData, setEquipTypeData] = useState(defaultEquipTypeObj);
    const [isProcessing, setIsProcessing] = useState(false);
    const [endUseData, setEndUseData] = useState([]);
    const [equipTypeNameError, setEquipTypeNameError] = useState(null);
    const [endUseIdError, setEndUseIdError] = useState(null);

    const handleChange = (key, value) => {
        let obj = Object.assign({}, equipTypeData);
        obj[key] = value;
        setEquipTypeData(obj);
    };

    const saveEquipTypeDetails = async () => {
        if ((equipTypeData?.name.trim()).length === 0) {
            setEquipTypeNameError('Please Enter Equipment Type Name.');
            return;
        }
        if (equipTypeData?.end_use.length === 0) {
            setEndUseIdError({ text: 'Please select End Use.' });
            return;
        }

        setIsProcessing(true);
        await saveEquipTypeData(equipTypeData)
            .then((res) => {
                const response = res;
                if (response?.status === 406) {
                    setEquipTypeNameError('Equipment Type with given name already exists.');
                    setIsProcessing(false);
                    return;
                }

                if (response?.data?.success) {
                    UserStore.update((s) => {
                        s.showNotification = true;
                        s.notificationMessage = response?.data?.message;
                        s.notificationType = 'success';
                    });
                    closeAddEquipTypeModal();
                    setEquipTypeData(defaultEquipTypeObj);
                    fetchEquipTypeData(search);
                } else {
                    UserStore.update((s) => {
                        s.showNotification = true;
                        s.notificationMessage = response?.data?.message
                            ? response?.data?.message
                            : 'Unable to Create Equipment Type.';
                        s.notificationType = 'error';
                    });
                }
                setIsProcessing(false);
            })
            .catch((e) => {
                setIsProcessing(false);
            });
    };

    const fetchEndUseData = async () => {
        let response = await getEndUseData();
        if (response?.data.length === 0) {
            setEndUseData([]);
            return;
        }
        let data = [];
        response.data.sort((a, b) => {
            return a.name.localeCompare(b.name);
        });
        response.data.forEach((record) => {
            data.push({
                label: record?.name,
                value: record?.end_user_id,
            });
        });
        setEndUseData(data);
    };

    useEffect(() => {
        if (isAddEquipTypeModalOpen) fetchEndUseData();
    }, [isAddEquipTypeModalOpen]);

    return (
        <Modal
            show={isAddEquipTypeModalOpen}
            onHide={closeAddEquipTypeModal}
            backdrop="static"
            keyboard={false}
            centered>
            <div className="p-4">
                <Typography.Header size={Typography.Sizes.lg}>Add Equipment Type</Typography.Header>

                <Brick sizeInRem={2} />

                <Typography.Body size={Typography.Sizes.md}>
                    Name
                    <span style={{ color: colorPalette.error600 }} className="font-weight-bold ml-1">
                        *
                    </span>
                </Typography.Body>
                <Brick sizeInRem={0.25} />
                <InputTooltip
                    placeholder="Enter Name"
                    onChange={(e) => {
                        handleChange('name', e.target.value.trim());
                        setEquipTypeNameError(null);
                    }}
                    error={equipTypeNameError}
                    labelSize={Typography.Sizes.md}
                />

                <Brick sizeInRem={1.5} />

                <div>
                    <Typography.Body size={Typography.Sizes.md}>
                        End Use
                        <span style={{ color: colorPalette.error600 }} className="font-weight-bold ml-1">
                            *
                        </span>
                    </Typography.Body>
                    <Brick sizeInRem={0.25} />
                    <Select
                        placeholder="Select End Use"
                        options={endUseData}
                        defaultValue={endUseData.filter((option) => option.value === equipTypeData?.end_use)}
                        onChange={(e) => {
                            handleChange('end_use', e.value);
                            setEndUseIdError(null);
                        }}
                        isSearchable={true}
                        error={endUseIdError}
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
                            setEquipTypeData(defaultEquipTypeObj);
                            closeAddEquipTypeModal();
                        }}
                    />

                    <Button
                        label={isProcessing ? 'Adding...' : 'Add Equipment Type'}
                        size={Button.Sizes.lg}
                        type={Button.Type.primary}
                        className="w-100"
                        disabled={isProcessing}
                        onClick={saveEquipTypeDetails}
                    />
                </div>

                <Brick sizeInRem={1} />
            </div>
        </Modal>
    );
};

export default CreateEquipType;
