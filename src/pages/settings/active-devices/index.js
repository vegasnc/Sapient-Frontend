import React, { useState, useEffect } from 'react';
import { Row, Col } from 'reactstrap';
import { useAtom } from 'jotai';
import { useParams, Link, useHistory } from 'react-router-dom';

import { BreadcrumbStore } from '../../../store/BreadcrumbStore';
import { BuildingStore } from '../../../store/BuildingStore';
import { ComponentStore } from '../../../store/ComponentStore';
import { buildingData, userPermissionData } from '../../../store/globalState';

import Brick from '../../../sharedComponents/brick';
import Typography from '../../../sharedComponents/typography';

import { StatusBadge } from '../../../sharedComponents/statusBadge';
import { Button } from '../../../sharedComponents/button';
import { Badge } from '../../../sharedComponents/badge';

import { DataTableWidget } from '../../../sharedComponents/dataTableWidget';
import { FILTER_TYPES } from '../../../sharedComponents/dataTableWidget/constants';
import useCSVDownload from '../../../sharedComponents/hooks/useCSVDownload';

import SkeletonLoader from '../../../components/SkeletonLoader';

import { ReactComponent as PlusSVG } from '../../../assets/icon/plus.svg';
import { ReactComponent as WifiSVG } from '../../../sharedComponents/assets/icons/wifi.svg';
import { ReactComponent as WifiSlashSVG } from '../../../sharedComponents/assets/icons/wifislash.svg';

import { pageListSizes } from '../../../helpers/helpers';
import { getActiveDeviceTableCSVExport } from '../../../utils/tablesExport';

import { updateBuildingStore } from '../../../helpers/updateBuildingStore';

import { getActiveDeviceData, fetchActiveFilter, getSingleActiveDevice } from './services';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import './style.css';

const ActiveDevices = () => {
    const { bldgId } = useParams();
    const history = useHistory();
    const [buildingListData] = useAtom(buildingData);
    const bldgName = BuildingStore.useState((s) => s.BldgName);

    const [userPermission] = useAtom(userPermissionData);
    const isUserAdmin = userPermission?.is_admin ?? false;
    const isSuperUser = userPermission?.is_superuser ?? false;
    const isSuperAdmin = isUserAdmin || isSuperUser;
    const canUserView = userPermission?.permissions?.permissions?.advanced_active_device_permission?.view ?? false;
    const canUserCreate = userPermission?.permissions?.permissions?.advanced_active_device_permission?.create ?? false;
    const canUserEdit = userPermission?.permissions?.permissions?.advanced_active_device_permission?.edit ?? false;

    const { download } = useCSVDownload();
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState({});
    const [pageNo, setPageNo] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [deviceStatus, setDeviceStatus] = useState(0);
    const [activeDeviceData, setActiveDeviceData] = useState([]);
    const [totalItems, setTotalItems] = useState(0);
    const [isDeviceProcessing, setIsDeviceProcessing] = useState(true);
    const [isFilterFetching, setFetchingFilters] = useState(false);
    const [deviceIdFilterString, setDeviceIdFilterString] = useState([]);
    const [deviceModelString, setDeviceModelString] = useState([]);
    const [sensorString, setSensorString] = useState([]);
    const [floorString, setFloorString] = useState([]);
    const [spaceString, setSpaceString] = useState([]);
    const [firmWareString, setFirmWareString] = useState([]);
    const [hardWareString, setHardWareString] = useState([]);
    const [filterOptions, setFilterOptions] = useState([]);
    const [isCSVDownloading, setDownloadingCSVData] = useState(false);

    const modifySensorFilter = (fractions) => {
        const numerators = [];

        for (let fraction of fractions) {
            const parts = fraction.split('/');
            const numerator = parseInt(parts[0]);
            numerators.push(numerator);
        }

        return numerators.join('+');
    };

    const getFilters = async () => {
        setFetchingFilters(true);
        let macAddressSelected = encodeURIComponent(deviceIdFilterString.join('+'));
        let deviceModelSelected = encodeURIComponent(deviceModelString.join('+'));
        let sensorSelected = modifySensorFilter(sensorString);
        let firmwareSelected = encodeURIComponent(firmWareString.join('+'));
        let hardwareSelected = encodeURIComponent(hardWareString.join('+'));
        let floorSelected = encodeURIComponent(floorString.join('+'));
        let spaceSelected = encodeURIComponent(spaceString.join('+'));

        const filters = await fetchActiveFilter({
            bldgId,
            macAddressSelected,
            deviceModelSelected,
            sensorSelected,
            firmwareSelected,
            hardwareSelected,
            floorSelected,
            spaceSelected,
        });
        filters.data.forEach((filterOptions) => {
            const sortedFloors = filterOptions?.installed_floor
                .slice()
                .sort((a, b) => a.floor_name.localeCompare(b.floor_name));

            const sortedSpaces = filterOptions?.installed_space
                .slice()
                .sort((a, b) => a.space_name.localeCompare(b.space_name));

            if ((floorString?.length === 0 && spaceString?.length === 0) || floorString?.includes('none'))
                sortedFloors.unshift({ floor_id: 'none', floor_name: 'None' });
            if ((floorString?.length === 0 && spaceString?.length === 0) || spaceString?.includes('none'))
                sortedSpaces.unshift({ space_id: 'none', space_name: 'None' });

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
                        setPageNo(1);
                        setDeviceIdFilterString([]);
                    },
                },
                {
                    label: 'Model',
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
                        setPageNo(1);
                        setDeviceModelString([]);
                    },
                },
                {
                    label: 'Floors',
                    value: 'floor',
                    placeholder: 'All Floors',
                    filterType: FILTER_TYPES.MULTISELECT,
                    filterOptions: sortedFloors.map((filterItem) => ({
                        value: filterItem.floor_id,
                        label: filterItem.floor_name,
                    })),
                    onClose: (options) => {
                        let opt = options;
                        if (opt.length !== 0) {
                            let sensors = [];
                            for (let i = 0; i < opt.length; i++) {
                                sensors.push(opt[i].value);
                            }
                            setFloorString(sensors);
                        }
                    },
                    onDelete: () => {
                        setPageNo(1);
                        setFloorString([]);
                    },
                },
                {
                    label: 'Spaces',
                    value: 'space',
                    placeholder: 'All Spaces',
                    filterType: FILTER_TYPES.MULTISELECT,
                    filterOptions: sortedSpaces.map((filterItem) => ({
                        value: filterItem.space_id,
                        label: filterItem.space_name,
                    })),
                    onClose: (options) => {
                        let opt = options;
                        if (opt.length !== 0) {
                            let sensors = [];
                            for (let i = 0; i < opt.length; i++) {
                                sensors.push(opt[i].value);
                            }
                            setSpaceString(sensors);
                        }
                    },
                    onDelete: () => {
                        setPageNo(1);
                        setSpaceString([]);
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
                        setPageNo(1);
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
                        setPageNo(1);
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
                        setPageNo(1);
                        setHardWareString([]);
                    },
                },
            ];
            setFilterOptions(filterOptionsFetched);
        });
        setFetchingFilters(false);
    };

    const fetchActiveDeviceData = async () => {
        const sorting = sortBy.method &&
            sortBy.name && {
                order_by: sortBy.name === undefined ? 'identifier' : sortBy.name,
                sort_by: sortBy.method === undefined ? 'ace' : sortBy.method,
            };
        let macAddressSelected = encodeURIComponent(deviceIdFilterString.join('+'));
        let deviceModelSelected = encodeURIComponent(deviceModelString.join('+'));
        let sensorSelected = encodeURIComponent(sensorString.join('+'));
        let floorSelected = encodeURIComponent(floorString.join('+'));
        let spaceSelected = encodeURIComponent(spaceString.join('+'));
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
            hardwareSelected,
            floorSelected,
            spaceSelected
        )
            .then((res) => {
                const response = res?.data;
                if (response?.data) {
                    for (const element of response?.data) {
                        element.bldg_id = bldgId;
                    }
                    setActiveDeviceData(response?.data);
                }
                if (response?.total_data) setTotalItems(response?.total_data);
                setIsDeviceProcessing(false);
            })
            .catch(() => {
                setIsDeviceProcessing(false);
            });
    };

    const updateBreadcrumbStore = () => {
        BreadcrumbStore.update((bs) => {
            let newList = [
                {
                    label: 'Smart Plugs',
                    path: '/settings/smart-plugs',
                    active: true,
                },
            ];
            bs.items = newList;
        });
        ComponentStore.update((s) => {
            s.parent = 'building-settings';
        });
    };

    const handleDeviceEdit = (record) => {
        history.push({
            pathname: `/settings/smart-plugs/single/${bldgId}/${record?.equipments_id}`,
        });
    };

    useEffect(() => {
        fetchActiveDeviceData();
        getFilters();
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
        floorString,
        spaceString,
        firmWareString,
        hardWareString,
    ]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pageNo, pageSize]);

    useEffect(() => {
        updateBreadcrumbStore();
    }, []);

    useEffect(() => {
        if (bldgId && buildingListData && buildingListData.length !== 0) {
            const bldgObj = buildingListData.find((el) => el?.building_id === bldgId);
            if (bldgObj?.building_id)
                updateBuildingStore(
                    bldgObj?.building_id,
                    bldgObj?.building_name,
                    bldgObj?.timezone,
                    bldgObj?.plug_only
                );
        }
    }, [buildingListData, bldgId]);

    const currentRow = () => {
        return activeDeviceData;
    };

    const handleDownloadCsv = async () => {
        setDownloadingCSVData(true);
        const params = `?building_id=${bldgId}`;

        await getSingleActiveDevice(params)
            .then((res) => {
                const responseData = res?.data?.data;
                let csvData = getActiveDeviceTableCSVExport(responseData, headerProps);
                download(`${bldgName}_Active_Devices_${new Date().toISOString().split('T')[0]}`, csvData);
            })
            .catch(() => {})
            .finally(() => {
                setDownloadingCSVData(false);
            });
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
                    pathname: `/settings/smart-plugs/single/${row?.bldg_id}/${row.equipments_id}`,
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
            accessor: 'sensor_number',
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
                            <Typography.Header size={Typography.Sizes.lg}>{`Smart Plugs`}</Typography.Header>
                        </div>
                        {isSuperAdmin || canUserCreate ? (
                            <div className="d-flex">
                                <Link
                                    to={{
                                        pathname: `/settings/smart-plugs/provision/${bldgId}`,
                                    }}>
                                    <Button
                                        label={`Add Smart Plug`}
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
                        isLoadingComponent={<SkeletonLoader noOfColumns={headerProps.length + 1} noOfRows={15} />}
                        isFilterLoading={isFilterFetching}
                        id="active_devices_list"
                        onSearch={(query) => {
                            setPageNo(1);
                            setSearch(query);
                        }}
                        onStatus={(query) => {
                            setPageNo(1);
                            setPageSize(20);
                            setDeviceStatus(query);
                        }}
                        rows={currentRow()}
                        searchResultRows={currentRow()}
                        filterOptions={filterOptions}
                        onDownload={() => handleDownloadCsv()}
                        isCSVDownloading={isCSVDownloading}
                        headers={headerProps}
                        currentPage={pageNo}
                        onChangePage={setPageNo}
                        pageSize={pageSize}
                        onPageSize={setPageSize}
                        pageListSizes={pageListSizes}
                        isEditable={() => isSuperAdmin || canUserEdit}
                        onEditRow={isSuperAdmin || canUserEdit ? (record, id, row) => handleDeviceEdit(row) : null}
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
