import React, { useState, useEffect } from 'react';
import { Row, Col } from 'reactstrap';
import { Link } from 'react-router-dom';
import { getActiveDeviceData, fetchActiveFilter } from './services';
import { BreadcrumbStore } from '../../../store/BreadcrumbStore';
import { BuildingStore } from '../../../store/BuildingStore';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import { ComponentStore } from '../../../store/ComponentStore';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import './style.css';
import { useAtom } from 'jotai';
import { userPermissionData } from '../../../store/globalState';
import Brick from '../../../sharedComponents/brick';
import Typography from '../../../sharedComponents/typography';
import { ReactComponent as PlusSVG } from '../../../assets/icon/plus.svg';
import useCSVDownload from '../../../sharedComponents/hooks/useCSVDownload';
import { DataTableWidget } from '../../../sharedComponents/dataTableWidget';
import { FILTER_TYPES } from '../../../sharedComponents/dataTableWidget/constants';
import { StatusBadge } from '../../../sharedComponents/statusBadge';
import { ReactComponent as WifiSlashSVG } from '../../../sharedComponents/assets/icons/wifislash.svg';
import { ReactComponent as WifiSVG } from '../../../sharedComponents/assets/icons/wifi.svg';
import { Button } from '../../../sharedComponents/button';
import { Badge } from '../../../sharedComponents/badge';
import { pageListSizes } from '../../../helpers/helpers';
import { getActiveDeviceTableCSVExport } from '../../../utils/tablesExport';

const SkeletonLoading = () => (
    <SkeletonTheme color="$primary-gray-1000" height={35}>
        <tr>
            <th>
                <Skeleton count={10} />
            </th>

            <th>
                <Skeleton count={10} />
            </th>

            <th>
                <Skeleton count={10} />
            </th>

            <th>
                <Skeleton count={10} />
            </th>

            <th>
                <Skeleton count={10} />
            </th>

            <th>
                <Skeleton count={10} />
            </th>

            <th>
                <Skeleton count={10} />
            </th>

            <th>
                <Skeleton count={10} />
            </th>
        </tr>
    </SkeletonTheme>
);

const ActiveDevices = () => {
    const bldgId = BuildingStore.useState((s) => s.BldgId);
    const [userPermission] = useAtom(userPermissionData);

    const { download } = useCSVDownload();
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState({});
    const [pageNo, setPageNo] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [deviceStatus, setDeviceStatus] = useState(0);
    const [activeDeviceData, setActiveDeviceData] = useState([]);
    const [totalItems, setTotalItems] = useState(0);
    const [isDeviceProcessing, setIsDeviceProcessing] = useState(true);
    const [deviceIdFilterString, setDeviceIdFilterString] = useState([]);
    const [deviceModelString, setDeviceModelString] = useState([]);
    const [sensorString, setSensorString] = useState([]);
    const [firmWareString, setFirmWareString] = useState([]);
    const [hardWareString, setHardWareString] = useState([]);
    const [filterOptions, setFilterOptions] = useState([]);

    useEffect(() => {
        const fetchActiveDeviceData = async () => {
            const sorting = sortBy.method &&
                sortBy.name && {
                    order_by: sortBy.name,
                    sort_by: sortBy.method,
                };
            let macAddressSelected = encodeURIComponent(deviceIdFilterString.join('+'));
            let deviceModelSelected = encodeURIComponent(deviceModelString.join('+'));
            let sensorSelected = encodeURIComponent(sensorString.join('+'));
            let firmwareSelected = encodeURIComponent(firmWareString.join('+'));
            let hardwareSelected = encodeURIComponent(hardWareString.join('+'));
            setIsDeviceProcessing(true);
            setActiveDeviceData([]);
            await getActiveDeviceData(
                pageNo,
                pageSize,
                bldgId,
                search,
                deviceStatus,
                {
                    ...sorting,
                },
                macAddressSelected,
                deviceModelSelected,
                sensorSelected,
                firmwareSelected,
                hardwareSelected
            )
                .then((res) => {
                    let response = res.data;
                    setActiveDeviceData(response.data);
                    setTotalItems(response?.total_data);
                    setIsDeviceProcessing(false);
                })
                .catch(() => {
                    setIsDeviceProcessing(false);
                });
        };
        fetchActiveDeviceData();
    }, [
        search,
        sortBy,
        pageNo,
        pageSize,
        deviceStatus,
        bldgId,
        deviceIdFilterString,
        deviceModelString,
        sensorString,
        firmWareString,
        hardWareString,
    ]);

    const getFilters = async () => {
        let macAddressSelected = encodeURIComponent(deviceIdFilterString.join('+'));
        let deviceModelSelected = encodeURIComponent(deviceModelString.join('+'));
        let firmwareSelected = encodeURIComponent(firmWareString.join('+'));
        let hardwareSelected = encodeURIComponent(hardWareString.join('+'));
        const filters = await fetchActiveFilter({
            bldgId,
            macAddressSelected,
            deviceModelSelected,
            firmwareSelected,
            hardwareSelected,
        });
        filters.data.forEach((filterOptions) => {
            const filterOptionsFetched = [
                {
                    label: 'Identifier',
                    value: 'identifier',
                    placeholder: 'All Identifiers',
                    filterType: FILTER_TYPES.MULTISELECT,
                    filterOptions: filterOptions.mac_address.map((filterItem) => ({
                        value: filterItem,
                        label: filterItem,
                    })),
                    onClose: (options) => {
                        let opt = options;
                        if (opt.length !== 0) {
                            let macAddress = [];
                            for (let i = 0; i < opt.length; i++) {
                                macAddress.push(opt[i].value);
                            }
                            setDeviceIdFilterString(macAddress);
                        }
                    },
                    onDelete: () => {
                        setDeviceIdFilterString([]);
                    },
                },
                {
                    label: 'Models',
                    value: 'model',
                    placeholder: 'All Models',
                    filterType: FILTER_TYPES.MULTISELECT,
                    filterOptions: filterOptions.model.map((filterItem) => ({
                        value: filterItem,
                        label: filterItem,
                    })),
                    onClose: (options) => {
                        let opt = options;
                        if (opt.length !== 0) {
                            let deviceModel = [];
                            for (let i = 0; i < opt.length; i++) {
                                deviceModel.push(opt[i].value);
                            }
                            setDeviceModelString(deviceModel);
                        }
                    },
                    onDelete: () => {
                        setDeviceModelString([]);
                    },
                },
                {
                    label: 'Sensors',
                    value: 'sensor_number',
                    placeholder: 'All Sensors',
                    filterType: FILTER_TYPES.MULTISELECT,
                    filterOptions: filterOptions.sensor_number.map((filterItem) => ({
                        value: filterItem,
                        label: filterItem,
                    })),
                    onClose: (options) => {
                        let opt = options;
                        if (opt.length !== 0) {
                            let sensors = [];
                            for (let i = 0; i < opt.length; i++) {
                                sensors.push(opt[i].value);
                            }
                            setSensorString(sensors);
                        }
                    },
                    onDelete: () => {
                        setSensorString([]);
                    },
                },
                {
                    label: 'FirmWare Version',
                    value: 'firmware_version',
                    placeholder: 'All FirmWare Version',
                    filterType: FILTER_TYPES.MULTISELECT,
                    filterOptions: filterOptions.firmware_version.map((filterItem) => ({
                        value: filterItem,
                        label: filterItem,
                    })),
                    onClose: (options) => {
                        let opt = options;
                        if (opt.length !== 0) {
                            let firmwares = [];
                            for (let i = 0; i < opt.length; i++) {
                                firmwares.push(opt[i].value);
                            }
                            setFirmWareString(firmwares);
                        }
                    },
                    onDelete: () => {
                        setFirmWareString([]);
                    },
                },
                {
                    label: 'HardWare Version',
                    value: 'hardware_version',
                    placeholder: 'All HardWare Version',
                    filterType: FILTER_TYPES.MULTISELECT,
                    filterOptions: filterOptions.hardware_version.map((filterItem) => ({
                        value: filterItem,
                        label: filterItem,
                    })),
                    onClose: (options) => {
                        let opt = options;
                        if (opt.length !== 0) {
                            let hardwares = [];
                            for (let i = 0; i < opt.length; i++) {
                                hardwares.push(opt[i].value);
                            }
                            setHardWareString(hardwares);
                        }
                    },
                    onDelete: () => {
                        setHardWareString([]);
                    },
                },
            ];

            setFilterOptions(filterOptionsFetched);
        });
    };

    useEffect(() => {
        getFilters();
    }, [bldgId]);

    useEffect(() => {
        const updateBreadcrumbStore = () => {
            BreadcrumbStore.update((bs) => {
                let newList = [
                    {
                        label: 'Active Devices',
                        path: '/settings/active-devices',
                        active: true,
                    },
                ];
                bs.items = newList;
            });
            ComponentStore.update((s) => {
                s.parent = 'building-settings';
            });
        };
        updateBreadcrumbStore();
    }, []);

    const currentRow = () => {
        return activeDeviceData;
    };

    const handleDownloadCsv = async () => {
        let params = `?building_id=${bldgId}`;
        await getActiveDeviceData(params)
            .then((res) => {
                const responseData = res?.data?.data;
                let csvData = getActiveDeviceTableCSVExport(responseData, headerProps);
                download('Active_Device_List', csvData);
            })
            .catch(() => {});
    };

    const renderDeviceStatus = (row) => {
        return (
            <StatusBadge
                text={row?.status ? 'Online' : 'Office'}
                type={row?.status ? StatusBadge.Type.success : StatusBadge.Type.error}
                icon={row?.status ? <WifiSVG /> : <WifiSlashSVG />}
            />
        );
    };

    const renderIdentifierName = (row) => {
        return (
            <Link
                className="typography-wrapper link"
                to={{
                    pathname: `/settings/active-devices/single/${row.equipments_id}`,
                }}>
                <a>{row.identifier}</a>
            </Link>
        );
    };

    const renderModelType = (row) => {
        return (
            <Typography.Body size={Typography.Sizes.md}>
                {row?.model === '' ? '-' : row?.model.charAt(0).toUpperCase() + row.model.slice(1)}
            </Typography.Body>
        );
    };

    const renderDeviceLocation = (row) => {
        return (
            <Typography.Body size={Typography.Sizes.md}>{row?.location === '' ? '-' : row?.location}</Typography.Body>
        );
    };

    const renderDeviceSensors = (row) => {
        return (
            <Badge
                text={
                    <Typography.Body size={Typography.Sizes.md}>
                        {row?.sensor_number === '' ? '-' : row?.sensor_number}
                    </Typography.Body>
                }
            />
        );
    };

    const renderFirmwareVersion = (row) => {
        return (
            <Typography.Body size={Typography.Sizes.md}>
                v{row?.firmware_version === '' ? '-' : row?.firmware_version}
            </Typography.Body>
        );
    };

    const renderHardwareVersion = (row) => {
        return (
            <Badge
                text={
                    <Typography.Body size={Typography.Sizes.md}>
                        v{row?.hardware_version === '' ? '-' : row?.hardware_version}
                    </Typography.Body>
                }
            />
        );
    };

    const headerProps = [
        {
            name: 'Status',
            accessor: 'stat',
            callbackValue: renderDeviceStatus,
            onSort: (method, name) => setSortBy({ method, name }),
        },
        {
            name: 'Identifier (MAC)',
            accessor: 'identifier',
            callbackValue: renderIdentifierName,
            onSort: (method, name) => setSortBy({ method, name }),
        },
        {
            name: 'Model',
            accessor: 'model',
            callbackValue: renderModelType,
            onSort: (method, name) => setSortBy({ method, name }),
        },
        {
            name: 'Location',
            accessor: 'location',
            callbackValue: renderDeviceLocation,
            onSort: (method, name) => setSortBy({ method, name }),
        },
        {
            name: 'Sensors',
            accessor: 'sensor_count',
            callbackValue: renderDeviceSensors,
            onSort: (method, name) => setSortBy({ method, name }),
        },
        {
            name: 'Firmware Version',
            accessor: 'firmware_version',
            callbackValue: renderFirmwareVersion,
            onSort: (method, name) => setSortBy({ method, name }),
        },
        {
            name: 'Hardware Version',
            accessor: 'hardware_version',
            callbackValue: renderHardwareVersion,
            onSort: (method, name) => setSortBy({ method, name }),
        },
    ];

    return (
        <React.Fragment>
            <Row>
                <Col lg={12}>
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <Typography.Header size={Typography.Sizes.lg}>Active Devices</Typography.Header>
                        </div>
                        {userPermission?.user_role === 'admin' ||
                        userPermission?.permissions?.permissions?.advanced_active_device_permission?.create ? (
                            <div className="d-flex">
                                <Link
                                    to={{
                                        pathname: `/settings/active-devices/provision`,
                                    }}>
                                    <Button
                                        label={'Add Active Device'}
                                        size={Button.Sizes.md}
                                        type={Button.Type.primary}
                                        icon={<PlusSVG />}
                                    />
                                </Link>
                            </div>
                        ) : null}
                    </div>
                </Col>
            </Row>

            <Brick sizeInRem={1.5} />

            <Row>
                <Col lg={12}>
                    <DataTableWidget
                        isLoading={isDeviceProcessing}
                        isLoadingComponent={<SkeletonLoading />}
                        id="active_devices_list"
                        onSearch={(query) => {
                            setPageNo(1);
                            setSearch(query);
                        }}
                        onStatus={setDeviceStatus}
                        rows={currentRow()}
                        searchResultRows={currentRow()}
                        filterOptions={filterOptions}
                        onDownload={() => handleDownloadCsv()}
                        headers={headerProps}
                        currentPage={pageNo}
                        onChangePage={setPageNo}
                        pageSize={pageSize}
                        onPageSize={setPageSize}
                        pageListSizes={pageListSizes}
                        totalCount={(() => {
                            return totalItems;
                        })()}
                    />
                </Col>
            </Row>
        </React.Fragment>
    );
};

export default ActiveDevices;
