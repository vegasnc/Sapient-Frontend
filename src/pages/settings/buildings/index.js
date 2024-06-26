import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import { Row, Col } from 'reactstrap';
import { Link } from 'react-router-dom';
import { useAtom } from 'jotai';

import { BreadcrumbStore } from '../../../store/BreadcrumbStore';
import { UserStore } from '../../../store/UserStore';
import { ComponentStore } from '../../../store/ComponentStore';
import { updateBuildingStore } from '../../../helpers/updateBuildingStore';
import { userPermissionData } from '../../../store/globalState';

import { DataTableWidget } from '../../../sharedComponents/dataTableWidget';
import Typography from '../../../sharedComponents/typography';
import { Badge } from '../../../sharedComponents/badge';
import Brick from '../../../sharedComponents/brick';
import { Button } from '../../../sharedComponents/button';
import { FILTER_TYPES } from '../../../sharedComponents/dataTableWidget/constants';
import { handleUnitConverstion } from '../general-settings/utils';

import { ReactComponent as PlusSVG } from '../../../assets/icon/plus.svg';

import { formatConsumptionValue } from '../../../helpers/helpers';
import useCSVDownload from '../../../sharedComponents/hooks/useCSVDownload';
import { getBuildingsTableCSVExport } from '../../../utils/tablesExport';

import CreateBuilding from './CreateBuilding';
import { fetchBuildingList, getFiltersForBuildingsRequest } from './services';
import SkeletonLoader from '../../../components/SkeletonLoader';

const Buildings = () => {
    const [userPermission] = useAtom(userPermissionData);

    const [filtersValues, setFiltersValues] = useState({});

    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState({});
    const [isCSVDownloading, setDownloadingCSVData] = useState(false);

    const { download } = useCSVDownload();

    const [isAddBuildingModalOpen, setShowBuildingModal] = useState(false);
    const closeAddBuildingModal = () => setShowBuildingModal(false);
    const openAddBuildingModal = () => setShowBuildingModal(true);

    const [isDataFetching, setIsDataFetching] = useState(false);
    const [buildingsData, setBuildingsData] = useState([]);
    const userPrefUnits = UserStore.useState((s) => s.unit);

    const [buildingTypeList, setBuildingTypeList] = useState([]);
    const [selectedBuildingType, setSelectedBuildingType] = useState([]);

    const [filterOptions, setFilterOptions] = useState([]);

    const [minVal, setMinVal] = useState(0);
    const [maxVal, setMaxVal] = useState(0);

    const [sqftAPIFlag, setSqftAPIFlag] = useState('');

    const [minSqftVal, setMinSqftVal] = useState(0);
    const [maxSqftVal, setMaxSqftVal] = useState(0);

    const [internalRoute, setInternalRoute] = useState([
        '/settings/general',
        '/settings/layout',
        '/settings/equipment',
        '/settings/panels',
        '/settings/smart-plugs',
    ]);

    const resetBuildingFilter = () => {
        setFiltersValues({
            selectedFilters: [],
        });
        setFilterOptions([]);
        setSelectedBuildingType([]);
        setMinSqftVal(0);
        setMaxSqftVal(maxVal);
        setSqftAPIFlag('');
        getFilters();
    };

    const handleBuildingClick = (record) => {
        updateBuildingStore(record?.building_id, record?.building_name, record?.timezone, record?.plug_only);
    };

    const renderBldgName = (row) => {
        return (
            <Link
                className="typography-wrapper link"
                to={`${internalRoute[0].concat(`/${row?.building_id}`)}`}
                onClick={() => {
                    handleBuildingClick(row);
                }}>
                {row?.building_name === '' ? '-' : row?.building_name}
            </Link>
        );
    };

    const renderBldgType = (row) => {
        return (
            <Badge
                text={
                    <Typography.Body size={Typography.Sizes.md} className="gray-950">
                        {row?.building_type === '' ? '-' : row?.building_type}
                    </Typography.Body>
                }
            />
        );
    };

    const renderDeviceCount = (row) => {
        return (
            <Typography.Body size={Typography.Sizes.md}>
                {row?.num_of_devices === '' ? '-' : formatConsumptionValue(row?.num_of_devices, 0)}
            </Typography.Body>
        );
    };

    const renderBldgSqft = (row) => {
        return (
            <Typography.Body size={Typography.Sizes.md}>
                {row?.building_size === '' ? '-' : formatConsumptionValue(row?.building_size, 0)}
            </Typography.Body>
        );
    };

    const [tableHeader, setTableHeader] = useState([
        {
            name: 'Building Name',
            accessor: 'building_name',
            callbackValue: renderBldgName,
            onSort: (method, name) => setSortBy({ method, name }),
        },
        {
            name: 'Building Type',
            accessor: 'building_type',
            callbackValue: renderBldgType,
            onSort: (method, name) => setSortBy({ method, name }),
        },
        {
            name: `${userPrefUnits === 'si' ? `Sq. M.` : `Sq. Ft.`}`,
            accessor: 'building_size',
            callbackValue: renderBldgSqft,
            onSort: (method, name) => setSortBy({ method, name }),
        },
        {
            name: 'Devices',
            accessor: 'num_of_devices',
            callbackValue: renderDeviceCount,
            onSort: (method, name) => setSortBy({ method, name }),
        },
    ]);

    const currentRow = () => {
        return buildingsData;
    };

    const fetchUserPermission = () => {
        if (userPermission?.user_role !== 'admin') {
            if (!userPermission?.permissions?.permissions?.building_details_permission?.view) {
                setInternalRoute((el) =>
                    el.filter((current) => {
                        return current !== '/settings/general';
                    })
                );
            }
            if (!userPermission?.permissions?.permissions?.building_layout_permission?.view) {
                setInternalRoute((el) =>
                    el.filter((current) => {
                        return current !== '/settings/layout';
                    })
                );
            }
            if (!userPermission?.permissions?.permissions?.building_equipment_permission?.view) {
                setInternalRoute((el) =>
                    el.filter((current) => {
                        return current !== '/settings/equipment';
                    })
                );
            }
            if (!userPermission?.permissions?.permissions?.building_panels_permission?.view) {
                setInternalRoute((el) =>
                    el.filter((current) => {
                        return current !== '/settings/panels';
                    })
                );
                if (!internalRoute.includes('/settings/smart-plugs')) {
                    setInternalRoute((el) => [...el, '/settings/smart-plugs']);
                }
            }

            if (
                userPermission?.permissions?.permissions?.building_details_permission?.view &&
                !internalRoute.includes('/settings/general')
            ) {
                setInternalRoute((el) =>
                    el.filter((current) => {
                        return current !== '/settings/smart-plugs';
                    })
                );
                setInternalRoute((el) => [...el, '/settings/general']);
            }

            if (
                userPermission?.permissions?.permissions?.building_layout_permission?.view &&
                !internalRoute.includes('/settings/layout')
            ) {
                setInternalRoute((el) =>
                    el.filter((current) => {
                        return current !== '/settings/smart-plugs';
                    })
                );
                setInternalRoute((el) => [...el, '/settings/layout']);
            }

            if (
                userPermission?.permissions?.permissions?.building_equipment_permission?.view &&
                !internalRoute.includes('/settings/equipment')
            ) {
                setInternalRoute((el) =>
                    el.filter((current) => {
                        return current !== '/settings/smart-plugs';
                    })
                );
                setInternalRoute((el) => [...el, '/settings/equipment']);
            }

            if (
                userPermission?.permissions?.permissions?.building_panels_permission?.view &&
                !internalRoute.includes('/settings/panels')
            ) {
                setInternalRoute((el) =>
                    el.filter((current) => {
                        return current !== '/settings/smart-plugs';
                    })
                );
                setInternalRoute((el) => [...el, '/settings/panels']);
            }
        }
        if (userPermission.user_role === 'admin') {
            setInternalRoute([]);
            setInternalRoute(['/settings/general']);
        }
    };

    const getFilters = async () => {
        const responseData = await getFiltersForBuildingsRequest();
        const filterData = responseData.data[0];
        setBuildingTypeList(filterData?.building_type);
        setMinVal(filterData?.building_size_min);
        setMaxVal(filterData?.building_size_max);
        setMinSqftVal(filterData?.building_size_min);
        setMaxSqftVal(filterData?.building_size_max);
    };

    const handleDownloadCsv = async (user_pref_units) => {
        setDownloadingCSVData(true);
        const ordered_by = sortBy.name === undefined ? 'building_name' : sortBy.name;
        const sort_by = sortBy.method === undefined ? 'ace' : sortBy.method;
        const search = '';

        await fetchBuildingList(search, sort_by, ordered_by)
            .then((res) => {
                const responseData = res.data;
                if (responseData && responseData.length !== 0) {
                    responseData.forEach((el) => {
                        el.building_size = Math.round(handleUnitConverstion(el?.building_size, user_pref_units));
                    });
                    download(
                        `Buildings_${new Date().toISOString().split('T')[0]}`,
                        getBuildingsTableCSVExport(responseData, tableHeader)
                    );
                }
            })
            .catch((error) => {})
            .finally(() => {
                setDownloadingCSVData(false);
            });
    };

    const fetchGeneralBuildingData = async (user_pref_units) => {
        setIsDataFetching(true);

        const ordered_by = sortBy.name === undefined || sortBy.method === null ? 'building_name' : sortBy.name;
        const sort_by = sortBy.method === undefined || sortBy.method === null ? 'ace' : sortBy.method;

        await fetchBuildingList(search, sort_by, ordered_by, sqftAPIFlag)
            .then((res) => {
                const data = res?.data;
                data.length !== 0 &&
                    data.forEach((el) => {
                        el.building_size = Math.round(handleUnitConverstion(el?.building_size, user_pref_units));
                    });
                setBuildingsData(data);
                setIsDataFetching(false);
            })
            .catch(() => {
                setIsDataFetching(false);
            });
    };

    const fetchBuildingListByFilter = async (user_pref_units, building_type, min_val, max_val) => {
        setIsDataFetching(true);
        let buildingTypeSelected = encodeURIComponent(building_type.join('+'));

        const ordered_by = sortBy.name === undefined ? 'building_name' : sortBy.name;
        const sort_by = sortBy.method === undefined ? 'ace' : sortBy.method;

        await fetchBuildingList(search, sort_by, ordered_by, sqftAPIFlag, buildingTypeSelected, min_val, max_val)
            .then((res) => {
                const data = res?.data;
                data.length !== 0 &&
                    data.forEach((el) => {
                        el.building_size = Math.round(handleUnitConverstion(el?.building_size, user_pref_units));
                    });
                setBuildingsData(data);
                setIsDataFetching(false);
            })
            .catch(() => {
                setIsDataFetching(false);
            });
    };

    const updateBreadcrumbStore = () => {
        BreadcrumbStore.update((bs) => {
            let newList = [
                {
                    label: 'Buildings',
                    path: '/settings/buildings',
                    active: true,
                },
            ];
            bs.items = newList;
        });
        ComponentStore.update((s) => {
            s.parent = 'account';
        });
    };

    useEffect(() => {
        if (sqftAPIFlag === '' && selectedBuildingType.length === 0) {
            fetchGeneralBuildingData(userPrefUnits);
        } else fetchBuildingListByFilter(userPrefUnits, selectedBuildingType, minSqftVal, maxSqftVal);
    }, [sqftAPIFlag, sortBy, search, selectedBuildingType, userPrefUnits]);

    useEffect(() => {
        if (minSqftVal !== maxSqftVal && maxSqftVal !== 0) {
            const filterOptionsFetched = [
                {
                    label: 'Building Type',
                    value: 'building_type',
                    placeholder: 'All Building Types',
                    filterType: FILTER_TYPES.MULTISELECT,
                    filterOptions: buildingTypeList?.map((filterItem) => ({
                        value: filterItem.building_type_id,
                        label: filterItem.building_type,
                    })),
                    filterOptions: _.chain(buildingTypeList)
                        .sortBy('building_type')
                        .map((filterItem) => ({
                            value: filterItem?.building_type_id,
                            label: filterItem?.building_type,
                        }))
                        .value(),
                    onClose: (options) => {
                        let opt = options;
                        if (opt.length !== 0) {
                            let buildingType = [];
                            for (let i = 0; i < opt.length; i++) {
                                buildingType.push(opt[i].value);
                            }
                            setSelectedBuildingType(buildingType);
                        }
                    },
                    onDelete: () => {
                        setSelectedBuildingType([]);
                    },
                },
                {
                    label: 'Square Footage',
                    value: 'square_footage',
                    placeholder: 'All Square Footage',
                    filterType: FILTER_TYPES.RANGE_SELECTOR,
                    filterOptions: [minSqftVal, maxSqftVal],
                    componentProps: {
                        prefix: ' sq.ft.',
                        title: 'Square Footage',
                        min: minVal,
                        max: maxVal,
                        range: [minSqftVal, maxSqftVal],
                        withTrendsFilter: false,
                    },
                    onClose: function onClose(options) {
                        setMinSqftVal(options[0]);
                        setMaxSqftVal(options[1]);
                        setSqftAPIFlag(options[0] + options[1]);
                    },
                    onDelete: () => {
                        setMinSqftVal(0);
                        setMaxSqftVal(maxVal);
                        setSqftAPIFlag('');
                    },
                },
            ];
            setFilterOptions(filterOptionsFetched);
        }
    }, [buildingTypeList, minSqftVal, maxSqftVal, minVal, maxVal]);

    useEffect(() => {
        getFilters();
    }, [search]);

    useEffect(() => {
        fetchUserPermission();
    }, [userPermission]);

    useEffect(() => {
        if (userPrefUnits) {
            let newHeaderList = tableHeader;
            newHeaderList.forEach((record) => {
                if (record?.accessor === 'building_size') {
                    record.name = `${userPrefUnits === 'si' ? `Sq. M.` : `Sq. Ft.`}`;
                }
            });
            setTableHeader(newHeaderList);
        }
    }, [userPrefUnits]);

    useEffect(() => {
        window.scrollTo(0, 0);
        updateBreadcrumbStore();
    }, []);

    return (
        <React.Fragment>
            <Row>
                <Col lg={12}>
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <Typography.Header size={Typography.Sizes.lg}>Buildings</Typography.Header>
                        </div>
                        {userPermission?.user_role === 'admin' ||
                        userPermission?.permissions?.permissions?.account_buildings_permission?.create ? (
                            <div className="d-flex">
                                <Button
                                    label={'Add Building'}
                                    size={Button.Sizes.md}
                                    type={Button.Type.primary}
                                    onClick={() => {
                                        openAddBuildingModal();
                                    }}
                                    icon={<PlusSVG />}
                                />
                            </div>
                        ) : (
                            ''
                        )}
                    </div>
                </Col>
            </Row>

            <Brick sizeInRem={1.5} />

            <Row>
                <Col lg={12}>
                    <DataTableWidget
                        isLoading={isDataFetching}
                        isLoadingComponent={<SkeletonLoader noOfColumns={tableHeader.length} noOfRows={15} />}
                        id="buildings_list"
                        buttonGroupFilterOptions={[]}
                        onSearch={setSearch}
                        onStatus={[]}
                        rows={currentRow()}
                        searchResultRows={currentRow()}
                        onDownload={() => handleDownloadCsv(userPrefUnits)}
                        isCSVDownloading={isCSVDownloading}
                        filterOptions={filterOptions}
                        headers={tableHeader}
                        filters={filtersValues}
                        totalCount={(() => {
                            return 0;
                        })()}
                    />
                </Col>
            </Row>

            <CreateBuilding
                isAddBuildingModalOpen={isAddBuildingModalOpen}
                closeAddBuildingModal={closeAddBuildingModal}
                resetBuildingFilter={resetBuildingFilter}
            />
        </React.Fragment>
    );
};

export default Buildings;
