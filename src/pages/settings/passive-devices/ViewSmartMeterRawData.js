import React, { useState, useEffect } from 'react';
import { Spinner } from 'reactstrap';
import Modal from 'react-bootstrap/Modal';
import moment from 'moment';
import 'moment-timezone';

import { UserStore } from '../../../store/UserStore.js';
import useCSVDownload from '../../../sharedComponents/hooks/useCSVDownload.js';
import { getRawDeviceDataTableCSVExport } from '../../../utils/tablesExport.js';

import Typography from '../../../sharedComponents/typography';
import { Button } from '../../../sharedComponents/button';
import { pageListSizes } from '../../../helpers/helpers';
import SkeletonLoader from '../../../components/SkeletonLoader';
import { DataTableWidget } from '../../../sharedComponents/dataTableWidget';
import { DownloadButton } from './../../../sharedComponents/dataTableWidget/components/DownloadButton';

import { ReactComponent as RefreshSVG } from './../../../../src/assets/icon/refresh.svg';

import { getDeviceRawData } from './services.js';
import { formatConsumptionValue } from '../../../sharedComponents/helpers/helper.js';

import './styles.scss';

const ViewPassiveRawData = ({ isModalOpen, closeModal, bldgTimezone, selectedPassiveDevice }) => {
    const { download } = useCSVDownload();

    const userPrefDateFormat = UserStore.useState((s) => s.dateFormat);
    const userPrefTimeFormat = UserStore.useState((s) => s.timeFormat);

    const [isFetchingData, setDataFetching] = useState(false);
    const [isProcessing, setProcessing] = useState(false);
    const [isCSVDownloading, setCSVDownloading] = useState(false);

    const [pageNo, setPageNo] = useState(1);
    const [pageSize, setPageSize] = useState(20);

    const [rawDeviceData, setRawDeviceData] = useState([]);
    const [totalDataCount, setTotalDataCount] = useState(0);

    // Define a custom CSS class for the modal content
    const customModalStyle = {
        modalContent: {
            height: '90vh',
            overflowY: 'auto', // Enable vertical scrolling when content exceeds the height
        },
    };

    const currentRow = () => {
        return rawDeviceData;
    };

    function isValidDate(d) {
        return d instanceof Date && !isNaN(d);
    }

    const handleDateFormat = (last_login) => {
        let dt = '';
        if (isValidDate(new Date(last_login)) && last_login != null) {
            const last_dt = new Date(last_login);
            const dateFormat = userPrefDateFormat === `DD-MM-YYYY` ? `D MMM` : `MMM D`;
            const timeFormat = userPrefTimeFormat === `12h` ? `hh:mm A` : `HH:mm`;
            dt = moment.utc(last_dt).format(`${dateFormat} 'YY @ ${timeFormat}`);
        } else {
            dt = 'Never';
        }
        return dt;
    };

    const renderRawDataTimestamp = (row) => {
        const formattedTimestamp = handleDateFormat(row?.time_stamp);

        return (
            <Typography.Body size={Typography.Sizes.md} className="mouse-pointer" style={{ width: 'max-content' }}>
                {row?.time_stamp === '' ? '-' : formattedTimestamp}
            </Typography.Body>
        );
    };

    const renderGatewayMac = (row) => {
        return (
            <div size={Typography.Sizes.md} className="mouse-pointer" style={{ width: 'max-content' }}>
                {row?.gateway_mac === '' ? '-' : row?.gateway_mac}
            </div>
        );
    };

    const defaultHeaderProps = [
        {
            name: 'Timestamp',
            accessor: 'time_stamp',
            callbackValue: renderRawDataTimestamp,
        },
        {
            name: 'Gateway / MAC',
            accessor: 'gateway_mac',
            callbackValue: renderGatewayMac,
        },
        {
            name: 'Firmware',
            accessor: 'firmware',
        },
        {
            name: 'CT Firmware',
            accessor: 'ct_firmware',
        },
        {
            name: 'Counter',
            accessor: 'counter',
        },
        {
            name: 'Sensor Type',
            accessor: 'sensor_type',
        },
        {
            name: 'OTF_515',
            accessor: 'otf_515',
        },
        {
            name: 'RSSI',
            accessor: 'rssi',
        },
    ];

    const [headerProps, setHeaderProps] = useState(defaultHeaderProps);

    const fetchRawDataForDevice = async (bldg_id, device_id, page_no = 1, page_size = 20, bldg_tz) => {
        setDataFetching(true);
        setTotalDataCount(0);
        setRawDeviceData([]);

        const params = `?building_id=${bldg_id}&device_id=${device_id}&page_no=${page_no}&page_size=${page_size}&tz_info=${bldg_tz}`;

        await getDeviceRawData(params)
            .then((res) => {
                const response = res?.data;
                if (response?.total_count) setTotalDataCount(response?.total_count);
                if (response) {
                    if (response?.data.length !== 0) {
                        const responseData = response?.data;

                        const firstRecord = responseData[0];
                        if (firstRecord?.sensor_data) {
                            let headersListToMerge = [];

                            Object.keys(firstRecord?.sensor_data).forEach((key) => {
                                if (typeof firstRecord.sensor_data[key] === 'object') {
                                    headersListToMerge.push(
                                        ...Object.keys(firstRecord.sensor_data[key]).map((subKey) => ({
                                            name: `${key} ${subKey}`,
                                            accessor: `${key}_${subKey}`,
                                        }))
                                    );
                                } else {
                                    headersListToMerge.push({
                                        name: `${key}`,
                                        accessor: `${key}`,
                                    });
                                }
                            });

                            setHeaderProps([...defaultHeaderProps, ...headersListToMerge]);
                        }

                        // Transforming responseData to newResponseData format
                        const newResponseData = responseData.map((data) => {
                            const { sensor_data, ...rest } = data; // Extract sensor_data and other properties
                            const newData = {};

                            // Dynamically iterate through sensor_data keys and create new properties
                            Object.keys(sensor_data).forEach((key) => {
                                if (typeof firstRecord.sensor_data[key] === 'object') {
                                    const sensorKeys = Object.keys(sensor_data[key]);

                                    sensorKeys.length !== 0 &&
                                        sensorKeys.forEach((sensorKey) => {
                                            newData[`${key}_${sensorKey}`] = formatConsumptionValue(
                                                sensor_data[key][sensorKey],
                                                2
                                            );
                                        });
                                } else {
                                    newData[`${key}`] = formatConsumptionValue(sensor_data[key], 2);
                                }
                            });

                            return { ...rest, ...newData }; // Combining other properties with newly generated properties
                        });

                        setRawDeviceData(newResponseData);
                    }
                } else {
                    UserStore.update((s) => {
                        s.showNotification = true;
                        s.notificationMessage = 'Unable to update Raw Data for due to Internal Server Error!.';
                        s.notificationType = 'error';
                    });
                }
            })
            .catch(() => {
                UserStore.update((s) => {
                    s.showNotification = true;
                    s.notificationMessage = 'Unable to update Raw Data for due to Internal Server Error!.';
                    s.notificationType = 'error';
                });
            })
            .finally(() => {
                setDataFetching(false);
                setProcessing(false);
            });
    };

    const downloadRawDataForCSVExport = async (
        bldg_id,
        device_id,
        device_identifier = '',
        bldg_tz,
        latestHeaderProps
    ) => {
        setCSVDownloading(true);

        const params = `?building_id=${bldg_id}&device_id=${device_id}&tz_info=${bldg_tz}`;

        await getDeviceRawData(params)
            .then((res) => {
                const responseData = res?.data?.data;
                const firstRecord = responseData[0];

                if (responseData) {
                    // Transforming responseData to newResponseData format
                    const newResponseData = responseData.map((data) => {
                        const { sensor_data, ...rest } = data; // Extract sensor_data and other properties
                        const newData = {};

                        // Dynamically iterate through sensor_data keys and create new properties
                        Object.keys(sensor_data).forEach((key) => {
                            if (typeof firstRecord.sensor_data[key] === 'object') {
                                const sensorKeys = Object.keys(sensor_data[key]);

                                sensorKeys.length !== 0 &&
                                    sensorKeys.forEach((sensorKey) => {
                                        newData[`${key}_${sensorKey}`] = sensor_data[key][sensorKey];
                                    });
                            } else {
                                newData[`${key}`] = sensor_data[key];
                            }
                        });

                        return { ...rest, ...newData }; // Combining other properties with newly generated properties
                    });

                    const csvData = getRawDeviceDataTableCSVExport(
                        newResponseData,
                        latestHeaderProps,
                        handleDateFormat
                    );
                    download(`${device_identifier}_${new Date().toISOString().split('T')[0]}`, csvData);
                }
            })
            .catch(() => {})
            .finally(() => {
                setCSVDownloading(false);
            });
    };

    useEffect(() => {
        if (!isModalOpen) {
            setRawDeviceData([]);
            setHeaderProps(defaultHeaderProps);
            setPageNo(1);
            setPageSize(20);
        }
    }, [isModalOpen]);

    useEffect(() => {
        if (selectedPassiveDevice?.equipments_id && selectedPassiveDevice?.bldg_id) {
            fetchRawDataForDevice(
                selectedPassiveDevice?.bldg_id,
                selectedPassiveDevice?.equipments_id,
                pageNo,
                pageSize,
                bldgTimezone
            );
        }
    }, [selectedPassiveDevice, pageNo, pageSize, bldgTimezone]);

    return (
        <Modal show={isModalOpen} onHide={closeModal} size="xl" centered>
            <div className="modal-dialog-custom" style={customModalStyle.modalContent}>
                <div className="passive-header-wrapper d-flex justify-content-between" style={{ background: 'none' }}>
                    <div className="d-flex flex-column justify-content-between">
                        <Typography.Subheader size={Typography.Sizes.sm}>
                            {selectedPassiveDevice?.location}
                        </Typography.Subheader>
                        <Typography.Header size={Typography.Sizes.md}>
                            {selectedPassiveDevice?.identifier}
                        </Typography.Header>
                        <div className="d-flex justify-content-start mouse-pointer ">
                            <Typography.Subheader
                                size={Typography.Sizes.md}
                                className="typography-wrapper active-tab-style">
                                {`Raw Data`}
                            </Typography.Subheader>
                        </div>
                    </div>
                    <div className="d-flex" style={{ gap: '1.25rem' }}>
                        <div className="d-flex" style={{ gap: '0.25rem' }}>
                            <Button
                                label={''}
                                type={Button.Type.secondaryGrey}
                                size={Button.Sizes.md}
                                icon={!isProcessing ? <RefreshSVG /> : <Spinner size="sm" color="secondary" />}
                                className="data-table-widget-action-button"
                                onClick={() => {
                                    setProcessing(true);
                                    fetchRawDataForDevice(
                                        selectedPassiveDevice?.bldg_id,
                                        selectedPassiveDevice?.equipments_id,
                                        pageNo,
                                        pageSize,
                                        bldgTimezone
                                    );
                                }}
                            />
                            <DownloadButton
                                isCSVDownloading={isCSVDownloading}
                                onClick={() => {
                                    downloadRawDataForCSVExport(
                                        selectedPassiveDevice?.bldg_id,
                                        selectedPassiveDevice?.equipments_id,
                                        selectedPassiveDevice?.identifier,
                                        bldgTimezone,
                                        headerProps
                                    );
                                }}
                            />
                        </div>
                        <div>
                            <Button
                                label="Close"
                                size={Button.Sizes.md}
                                type={Button.Type.secondaryGrey}
                                onClick={closeModal}
                            />
                        </div>
                    </div>
                </div>

                <div className="default-padding">
                    <div className="raw-data-table-container">
                        <DataTableWidget
                            id="raw_data_list"
                            isLoading={isFetchingData}
                            isLoadingComponent={<SkeletonLoader noOfColumns={headerProps.length} noOfRows={10} />}
                            buttonGroupFilterOptions={[]}
                            rows={currentRow()}
                            disableColumnDragging={true}
                            searchResultRows={currentRow()}
                            headers={headerProps}
                            currentPage={pageNo}
                            onChangePage={setPageNo}
                            pageSize={pageSize}
                            onPageSize={setPageSize}
                            pageListSizes={pageListSizes}
                            totalCount={(() => {
                                return totalDataCount;
                            })()}
                            customStyle={{ width: headerProps.length > 10 ? 'fit-content' : null }}
                        />
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default ViewPassiveRawData;
