import React, { useState } from 'react';
import Modal from 'react-bootstrap/Modal';

import Typography from '../../../sharedComponents/typography';
import Brick from '../../../sharedComponents/brick';
import { Button } from '../../../sharedComponents/button';

const DeleteAlert = (props) => {
    const { isModalOpen, closeModal, selectedAlertObj, handleAlertDeletion, isDeleting = false } = props;

    return (
        <Modal show={isModalOpen} onHide={closeModal} centered backdrop="static" keyboard={false}>
            <Modal.Body className="p-4">
                <Typography.Header size={Typography.Sizes.lg}>{`Delete Alert`}</Typography.Header>
                <Brick sizeInRem={1.5} />
                <Typography.Body size={Typography.Sizes.lg}>
                    {`Are you sure you want to delete the Alert?`}
                </Typography.Body>
            </Modal.Body>
            <Modal.Footer className="pb-4 pr-4">
                <Button label="Cancel" size={Button.Sizes.lg} type={Button.Type.secondaryGrey} onClick={closeModal} />
                <Button
                    label={isDeleting ? 'Deleting' : 'Delete'}
                    size={Button.Sizes.lg}
                    type={Button.Type.primaryDistructive}
                    disabled={isDeleting}
                    onClick={() => {
                        handleAlertDeletion(selectedAlertObj?.id);
                    }}
                />
            </Modal.Footer>
        </Modal>
    );
};

export default DeleteAlert;
