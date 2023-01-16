import React, { useState, useEffect } from 'react';
import { Row, Col, Input } from 'reactstrap';
import { Link } from 'react-router-dom';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import { inviteMemberUsers, fetchMemberUserList, updateVendorPermissions, fetchUserFilters } from './service';
import { Cookies } from 'react-cookie';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import '../style.css';
import { ComponentStore } from '../../../store/ComponentStore';
import { BreadcrumbStore } from '../../../store/BreadcrumbStore';
import { UserStore } from '../../../store/UserStore';
import { useAtom } from 'jotai';
import { userPermissionData } from '../../../store/globalState';
import Typography from '../../../sharedComponents/typography';
import Button from '../../../sharedComponents/button/Button';
import { DataTableWidget } from '../../../sharedComponents/dataTableWidget';
import { FILTER_TYPES } from '../../../sharedComponents/dataTableWidget/constants';
import 'moment-timezone';
import moment from 'moment';
import { timeZone } from '../../../utils/helper';
import { useHistory } from 'react-router-dom';
import colorPalette from '../../../assets/scss/_colors.scss';
import { faCircleCheck, faClockFour, faBan } from '@fortawesome/pro-thin-svg-icons';
import { faPlus } from '@fortawesome/pro-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { pageListSizes } from '../../../helpers/helpers';

const SkeletonLoading = () => (
    <SkeletonTheme color="$primary-gray-1000" height={35}>
        <tr>
            <th>
                <Skeleton count={5} />
            </th>

            <th>
                <Skeleton count={5} />
            </th>

            <th>
                <Skeleton count={5} />
            </th>

            <th>
                <Skeleton count={5} />
            </th>

            <th>
                <Skeleton count={5} />
            </th>
        </tr>
    </SkeletonTheme>
);

const Users = () => {
    // Modal states
    const [show, setShow] = useState(false);
    const handleClose = () => {
        setUserObj({
            first_name: '',
            last_name: '',
            email: '',
            role: '',
        });
        setShow(false);
    };
    const handleShow = () => setShow(true);
    const [userPermission] = useAtom(userPermissionData);

    const [formValidation, setFormValidation] = useState(false);

    let cookies = new Cookies();
    let userdata = cookies.get('user');
    const history = useHistory();

    const [isProcessing, setIsProcessing] = useState(false);
    const [isUserDataFetched, setIsUserDataFetched] = useState(false);

    const [userData, setUserData] = useState([]);

    const [userSearchInfo, setUserSearchInfo] = useState('');
    const [sortBy, setSortBy] = useState({});
    const [pageNo, setPageNo] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [rolesData, setRolesData] = useState([]);
    const [totalItems, setTotalItems] = useState(0);
    const [selectedStatus, setSelectedStatus] = useState(0);
    const [filterOptions, setFilterOptions] = useState([]);
    const [permissionRoleIds, setPermissionRoleIds] = useState([]);

    const [userObj, setUserObj] = useState({
        first_name: '',
        last_name: '',
        email: '',
        role: '',
    });

    useEffect(() => {
        const updateBreadcrumbStore = () => {
            BreadcrumbStore.update((bs) => {
                let newList = [
                    {
                        label: 'Users',
                        path: '/settings/users',
                        active: true,
                    },
                ];
                bs.items = newList;
            });
            ComponentStore.update((s) => {
                s.parent = 'account';
            });
        };
        updateBreadcrumbStore();
    }, []);

    // setFormValidation
    useEffect(() => {
        if (
            userObj.first_name.length > 0 &&
            userObj.last_name.length > 0 &&
            userObj.role.length > 0 &&
            userObj.email.length > 0 &&
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,11})+$/.test(userObj.email)
        ) {
            setFormValidation(true);
        }
    }, [userObj]);

    useEffect(() => {
        if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,11})+$/.test(userObj.email)) {
            setFormValidation(false);
        }
    }, [userObj]);

    const handleChange = (key, value) => {
        let obj = Object.assign({}, userObj);
        obj[key] = value;
        setUserObj(obj);
    };

    const getUsersList = async () => {
        const ordered_by = sortBy.name === undefined || sortBy.method === null ? 'name' : sortBy.name;
        const sort_by = sortBy.method === undefined || sortBy.method === null ? 'ace' : sortBy.method;
        setIsUserDataFetched(true);
        let roleIds = encodeURIComponent(permissionRoleIds.join('+'));

        let params = `?user_info=${userSearchInfo}&page_size=${pageSize}&page_no=${pageNo}&sort_by=${sort_by}&ordered_by=${ordered_by}&timezone=${timeZone}`;
        if (selectedStatus == 3) {
            params += `&is_verified=false`;
        }
        if (selectedStatus == 2) {
            params += `&user_state=false&is_verified=true`;
        }
        if (selectedStatus == 1) {
            params += `&user_state=true&is_verified=true`;
        }
        if (roleIds.length) {
            params += `&permission_role_id=${roleIds}`;
        }

        await fetchMemberUserList(params)
            .then((res) => {
                let response = res.data;
                setUserData(response.data?.data);
                setTotalItems(response?.data?.total_users);
                setIsUserDataFetched(false);
            })
            .catch((error) => {
                setIsUserDataFetched(false);
            });
    };

    const getUserFilterData = async () => {
        let params = `?user_info=${userSearchInfo}`;
        await fetchUserFilters(params)
            .then((res) => {
                let response = res.data;
                response.data.forEach((filterOptions) => {
                    const filterOptionsFetched = [
                        {
                            label: 'Roles',
                            value: 'role',
                            placeholder: 'All Roles',
                            filterType: FILTER_TYPES.MULTISELECT,
                            filterOptions: filterOptions.permission_roles.map((filterItem) => ({
                                value: filterItem?.permission_id,
                                label: filterItem?.permission_name,
                            })),
                            onClose: (options) => {
                                let opt = options;
                                if (opt.length !== 0) {
                                    let perIds = [];
                                    for (let i = 0; i < opt.length; i++) {
                                        perIds.push(opt[i].value);
                                    }
                                    setPermissionRoleIds(perIds);
                                }
                            },
                            onDelete: () => {
                                setPermissionRoleIds([]);
                            },
                        },
                    ];
                    setFilterOptions(filterOptionsFetched);
                });
            })
            .catch((error) => {});
    };

    useEffect(() => {
        getUsersList();
    }, [userSearchInfo, sortBy, pageNo, pageSize, permissionRoleIds, selectedStatus]);

    useEffect(() => {
        getUserFilterData();
    }, [userSearchInfo]);

    const saveUserData = async () => {
        setIsProcessing(true);
        let userData = Object.assign({}, userObj);
        let params = '?request_type=invite';
        await inviteMemberUsers(userData, params)
            .then((res) => {
                let response = res.data;
                getUsersList();
                if (response?.success) {
                    UserStore.update((s) => {
                        s.showNotification = true;
                        s.notificationMessage = 'Invite has been sent';
                        s.notificationType = 'success';
                    });
                } else if (response?.success == false) {
                    UserStore.update((s) => {
                        s.showNotification = true;
                        s.notificationMessage = 'User Already Exist';
                        s.notificationType = 'error';
                    });
                }
                setIsProcessing(false);
                handleClose();
            })
            .catch((error) => {
                setIsProcessing(false);
            });
    };

    const fetchRoles = async () => {
        await updateVendorPermissions({}, '')
            .then((res) => {
                let response = res.data;
                setRolesData(response.data);
            })
            .catch((error) => {});
    };

    useEffect(() => {
        fetchRoles();
    }, []);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pageNo, pageSize]);

    const currentRow = () => {
        return userData;
    };
    const renderName = (row) => {
        return (
            <>
                {userPermission?.user_role === 'admin' ||
                userPermission?.permissions?.permissions?.account_user_permission?.edit ? (
                    <Link className="typography-wrapper link" to={`/settings/users/user-profile/single/${row?._id}`}>
                        <a>{row?.first_name ? row?.first_name + ' ' + row?.last_name : row?.name}</a>
                    </Link>
                ) : (
                    <Link className="typography-wrapper link" to={`/settings/users/user-profile/single/${row?._id}`}>
                        <a>{row?.first_name ? row?.first_name + ' ' + row?.last_name : row?.name}</a>
                    </Link>
                )}
            </>
        );
    };

    const renderRole = (row) => {
        return (
            <Typography.Body size={Typography.Sizes.sm}>
                {row?.role === '' ? '-' : row?.permissions[0].permission_name}
            </Typography.Body>
        );
    };

    const renderStatus = (row) => {
        if (row?.is_verified === false) {
            return (
                <Typography.Subheader
                    size={Typography.Sizes.sm}
                    className="d-flex pending-container justify-content-center"
                    style={{ color: colorPalette.warning700 }}>
                    <FontAwesomeIcon icon={faClockFour} size="lg" style={{ color: colorPalette.warning700 }} />
                    Pending
                </Typography.Subheader>
            );
        } else {
            if (row?.is_active === false) {
                return (
                    <Typography.Subheader
                        size={Typography.Sizes.sm}
                        className="d-flex inactive-container justify-content-center"
                        style={{ color: colorPalette.primaryGray800 }}>
                        <FontAwesomeIcon icon={faBan} size="lg" style={{ color: colorPalette.primaryGray800 }} />
                        Inactive
                    </Typography.Subheader>
                );
            } else if (row?.is_active === true) {
                return (
                    <Typography.Subheader
                        size={Typography.Sizes.sm}
                        className="d-flex active-container justify-content-center"
                        style={{ color: colorPalette.success700 }}>
                        <FontAwesomeIcon icon={faCircleCheck} size="lg" style={{ color: colorPalette.success700 }} />
                        Active
                    </Typography.Subheader>
                );
            }
        }
    };

    const renderEmail = (row) => {
        return <Typography.Body size={Typography.Sizes.sm}>{row?.email === '' ? '-' : row?.email}</Typography.Body>;
    };

    function isValidDate(d) {
        return d instanceof Date && !isNaN(d);
    }

    const renderLastActive = (row) => {
        let dt = '';
        if (isValidDate(new Date(row?.last_login)) && row?.last_login != null) {
            let last_dt = new Date(row?.last_login);
            dt = moment.utc(last_dt).format(`MMM D 'YY @ hh:mm A`);
        } else {
            dt = 'Never';
        }
        return <Typography.Body size={Typography.Sizes.sm}>{dt}</Typography.Body>;
    };

    return (
        <React.Fragment>
            <Row className="page-title">
                <Col className="header-container">
                    <span className="heading-style">Users</span>

                    <div className="btn-group custom-button-group float-right" role="group" aria-label="Basic example">
                        <div className="mr-2">
                            {userPermission?.user_role === 'admin' ||
                            userPermission?.permissions?.permissions?.account_user_permission?.create ? (
                                <Button
                                    label="Add User"
                                    size={Button.Sizes.lg}
                                    type={Button.Type.primary}
                                    icon={
                                        <FontAwesomeIcon
                                            icon={faPlus}
                                            size="lg"
                                            style={{ color: colorPalette.baseWhite }}
                                        />
                                    }
                                    iconAlignment={Button.IconAlignment.left}
                                    onClick={() => {
                                        handleShow();
                                    }}
                                />
                            ) : null}
                        </div>
                    </div>
                </Col>
            </Row>

            <Row>
                <Col lg={12} className="mt-4">
                    <DataTableWidget
                        isLoading={isUserDataFetched}
                        isLoadingComponent={<SkeletonLoading />}
                        id="users"
                        onSearch={(query) => {
                            setPageNo(1);
                            setUserSearchInfo(query);
                        }}
                        buttonGroupFilterOptions={[
                            { label: 'All' },
                            { label: 'Active' },
                            { label: 'Inactive' },
                            { label: 'Pending' },
                        ]}
                        filterOptions={filterOptions}
                        onStatus={(query) => {
                            setPageNo(1);
                            setPageSize(20);
                            setSelectedStatus(query);
                        }}
                        rows={currentRow()}
                        searchResultRows={currentRow()}
                        headers={[
                            {
                                name: 'Name',
                                accessor: 'name',
                                callbackValue: renderName,
                                onSort: (method, name) => setSortBy({ method, name }),
                            },
                            {
                                name: 'Email',
                                accessor: 'email',
                                callbackValue: renderEmail,
                                onSort: (method, name) => setSortBy({ method, name }),
                            },
                            {
                                name: 'Role',
                                accessor: 'role',
                                callbackValue: renderRole,
                                onSort: (method, name) => setSortBy({ method, name }),
                            },
                            {
                                name: 'status',
                                accessor: 'status',
                                callbackValue: renderStatus,
                                onSort: (method, name) => setSortBy({ method, name }),
                            },
                            {
                                name: 'Last Active',
                                accessor: 'last_active',
                                callbackValue: renderLastActive,
                                onSort: (method, name) => setSortBy({ method, name }),
                            },
                        ]}
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

            <Modal show={show} onHide={handleClose} backdrop="static" keyboard={false} centered>
                <Modal.Header>
                    <Typography.Header size={Typography.Sizes.sm}>Add User</Typography.Header>
                </Modal.Header>
                <Modal.Body className="add-user-model">
                    <Form autoComplete="off">
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                                    <Typography.Subheader className="mb-1">First Name</Typography.Subheader>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter First Name"
                                        onChange={(e) => {
                                            handleChange('first_name', e.target.value);
                                        }}
                                        value={userObj.first_name}
                                        autoFocus
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                                    <Typography.Subheader className="mb-1">Last Name</Typography.Subheader>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter Last Name"
                                        onChange={(e) => {
                                            handleChange('last_name', e.target.value);
                                        }}
                                        value={userObj.last_name}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                            <Typography.Subheader className="mb-1">Email Address</Typography.Subheader>
                            <Form.Control
                                type="text"
                                placeholder="Enter Sapient Email"
                                onChange={(e) => {
                                    handleChange('email', e.target.value);
                                }}
                                value={userObj.email}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                            <Typography.Subheader className="mb-1">User Role</Typography.Subheader>
                            <Input
                                type="select"
                                name="select"
                                id="roles"
                                contentEditable="false"
                                required
                                onChange={(e) => {
                                    handleChange('role', e.target.value);
                                }}
                                value={userObj?.role}>
                                <option selected>Select Role</option>
                                {rolesData?.map((record) => {
                                    return <option value={record?.id}>{record?.name}</option>;
                                })}
                            </Input>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <div style={{ display: 'flex', width: '100%', gap: '1.25rem' }}>
                        <Button
                            label="Cancel"
                            size={Button.Sizes.lg}
                            type={Button.Type.secondaryGrey}
                            className="d-flex align-items-center button-container"
                            onClick={() => {
                                handleClose();
                                setFormValidation(false);
                            }}
                        />
                        <Button
                            label={isProcessing ? 'Adding User...' : 'Add & Invite User'}
                            size={Button.Sizes.lg}
                            type={Button.Type.primary}
                            className="d-flex align-items-center button-container"
                            onClick={() => {
                                setIsProcessing(true);
                                saveUserData();
                            }}
                            disabled={!formValidation}
                        />
                    </div>
                </Modal.Footer>
            </Modal>
        </React.Fragment>
    );
};

export default Users;