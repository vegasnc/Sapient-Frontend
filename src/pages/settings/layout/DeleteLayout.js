import React from 'react';
import Modal from 'react-bootstrap/Modal';

import { Button } from '../../../sharedComponents/button';
import Typography from '../../../sharedComponents/typography';
import Brick from '../../../sharedComponents/brick';

const DeleteModal = (props) => {
    const { isModalOpen = false, onCancel, onSave, deleteType, isDeleting = false } = props;

    return (
        <Modal show={isModalOpen} backdrop="static" keyboard={false} size="md" centered>
            <Modal.Body className="p-4">
                <Typography.Header size={Typography.Sizes.lg}>
                    {deleteType === `FLOOR` ? `Delete Floor` : `Delete Space`}
                </Typography.Header>

                <Brick sizeInRem={1.5} />

                <Typography.Body size={Typography.Sizes.md}>
                    {deleteType === `FLOOR`
                        ? `Are you sure you want to delete the Floor and the Spaces it contains?`
                        : ` Are you sure you want to delete the Space and the Spaces it contains?`}
                </Typography.Body>
            </Modal.Body>

            <Modal.Footer className="pb-4 pr-4">
                <Button
                    label={`Cancel`}
                    size={Button.Sizes.lg}
                    type={Button.Type.secondaryGrey}
                    className="w-100"
                    onClick={onCancel}
                />
                <Button
                    label={isDeleting ? `Deleting...` : `Delete`}
                    size={Button.Sizes.lg}
                    type={Button.Type.primaryDistructive}
                    className="w-100"
                    onClick={onSave}
                    disabled={isDeleting}
                />
            </Modal.Footer>
        </Modal>
    );
};

export default DeleteModal;
