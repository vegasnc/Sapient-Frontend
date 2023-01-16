import React, { useState, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import Typography from '../../../sharedComponents/typography';
import Brick from '../../../sharedComponents/brick';
import { Button } from '../../../sharedComponents/button';
import { deleteEquipTypeData } from './services';

const DeleteEquipType = ({
    isDeleteEquipTypeModalOpen,
    closeDeleteEquipTypeModal,
    selectedEquipType,
    fetchEquipTypeData,
}) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [equipTypeId, setEquipTypeId] = useState('');

    const deleteEquipTypeRecord = async () => {
        setIsProcessing(true);
        let params = `?equipment_id=${equipTypeId}`;
        await deleteEquipTypeData(params)
            .then((res) => {
                closeDeleteEquipTypeModal();
                setEquipTypeId('');
                fetchEquipTypeData();
                setIsProcessing(false);
            })
            .catch(() => {
                setIsProcessing(false);
            });
    };

    useEffect(() => {
        if (isDeleteEquipTypeModalOpen) {
            setEquipTypeId(selectedEquipType?.equipment_id);
        }
    }, [isDeleteEquipTypeModalOpen]);

    return (
        <Modal
            show={isDeleteEquipTypeModalOpen}
            onHide={closeDeleteEquipTypeModal}
            centered
            backdrop="static"
            keyboard={false}>
            <Modal.Body className="p-4">
                <Typography.Header size={Typography.Sizes.lg}>Delete Equipment Type</Typography.Header>
                <Brick sizeInRem={1.5} />
                <Typography.Body size={Typography.Sizes.lg}>
                    Are you sure you want to delete the Equipment Type?
                </Typography.Body>
            </Modal.Body>
            <Modal.Footer className="pb-4 pr-4">
                <Button
                    label="Cancel"
                    size={Button.Sizes.lg}
                    type={Button.Type.secondaryGrey}
                    onClick={closeDeleteEquipTypeModal}
                />
                <Button
                    label={isProcessing ? 'Deleting' : 'Delete'}
                    size={Button.Sizes.lg}
                    type={Button.Type.primaryDistructive}
                    disabled={isProcessing}
                    onClick={() => {
                        // deleteEquipTypeRecord(); --- Function call will be enable once API is on! ---
                    }}
                />
            </Modal.Footer>
        </Modal>
    );
};

export default DeleteEquipType;