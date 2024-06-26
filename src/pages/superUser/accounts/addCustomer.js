import React, { useState, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import Typography from '../../../sharedComponents/typography';
import Brick from '../../../sharedComponents/brick';
import { Button } from '../../../sharedComponents/button';
import InputTooltip from '../../../sharedComponents/form/input/InputTooltip';
import colorPalette from '../../../assets/scss/_colors.scss';
import { createCustomer } from './services';
import { UserStore } from '../../../store/UserStore';
import { useNotification } from '../../../sharedComponents/notification/useNotification';
import { Notification } from '../../../sharedComponents/notification/Notification';

const CreateCustomer = ({ isAddCustomerOpen, closeAddCustomerModal, getCustomerList, setPageSize, setPageNo }) => {
    const defaultCustomerObj = {
        name: '',
    };
    const [openSnackbar] = useNotification();
    const mockData = {
        title: 'Account Created',
        description: 'It will appear in the list shortly',
    };

    const [customerData, setCustomerData] = useState(defaultCustomerObj);
    const [isProcessing, setIsProcessing] = useState(false);
    const [validate, setValidate] = useState(true);

    const handleChange = (key, value) => {
        let obj = Object.assign({}, customerData);
        obj[key] = value;
        setCustomerData(obj);
    };

    const createCustomers = async () => {
        setIsProcessing(true);
        let payload = { customer_name: customerData?.name };
        await createCustomer(payload)
            .then((res) => {
                let response = res.data;
                if (response.success === false) {
                    openSnackbar({
                        ...mockData,
                        title: 'Error',
                        description: response?.message,
                        type: Notification.Types.error,
                    });
                } else {
                    openSnackbar({ ...mockData, type: Notification.Types.success });
                    closeAddCustomerModal();
                    getCustomerList();
                    setPageNo(1);
                    setPageSize(20);
                }
                setIsProcessing(false);
                closeAddCustomerModal();
            })
            .catch((error) => {
                setIsProcessing(false);
            });
    };
    useEffect(() => {
        if (customerData?.name?.length >= 3) {
            setValidate(false);
        } else {
            setValidate(true);
        }
    }, [customerData]);

    return (
        <Modal
            show={isAddCustomerOpen}
            onHide={closeAddCustomerModal}
            dialogClassName="customer-container-style"
            backdrop="static"
            keyboard={false}
            centered>
            <div className="p-4">
                <Typography.Header size={Typography.Sizes.lg}>Add Customer</Typography.Header>

                <Brick sizeInRem={2} />

                <Typography.Body size={Typography.Sizes.md}>
                    Customer Name
                    <span style={{ color: colorPalette.error600 }} className="font-weight-bold ml-1">
                        *
                    </span>
                </Typography.Body>
                <Brick sizeInRem={0.25} />
                <InputTooltip
                    placeholder="Enter Customer Name"
                    onChange={(e) => {
                        handleChange('name', e.target.value.trim());
                    }}
                    labelSize={Typography.Sizes.md}
                />

                <Brick sizeInRem={2.5} />

                <div className="d-flex justify-content-between w-100">
                    <Button
                        label="Cancel"
                        size={Button.Sizes.lg}
                        type={Button.Type.secondaryGrey}
                        className="w-100"
                        onClick={closeAddCustomerModal}
                    />

                    <Button
                        label={isProcessing ? 'Adding...' : 'Add'}
                        size={Button.Sizes.lg}
                        type={Button.Type.primary}
                        className="w-100"
                        disabled={isProcessing || validate}
                        onClick={() => {
                            createCustomers();
                        }}
                    />
                </div>

                <Brick sizeInRem={1} />
            </div>
        </Modal>
    );
};

export default CreateCustomer;
