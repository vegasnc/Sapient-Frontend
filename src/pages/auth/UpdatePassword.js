import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Cookies } from 'react-cookie';
import { connect } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { Col, Row } from 'reactstrap';
import { FormGroup } from 'reactstrap';
import Loader from '../../components/Loader';
import Holder from './Holder';
import Typography from '../../sharedComponents/typography';
import { ReactComponent as EyeSVG } from '../../assets/icon/eye.svg';
import { ReactComponent as EyeSlashSVG } from '../../assets/icon/eye-slash.svg';
import { ReactComponent as Check } from '../../assets/icon/circle-check.svg';
import { ReactComponent as CheckXmark } from '../../assets/icon/circle-xmark.svg';
import { ReactComponent as CheckMinusMark } from '../../assets/icon/circle-minusmark.svg';
import { ReactComponent as LogoSVG } from '../../assets/icon/Logo1.svg';
import { ReactComponent as Exclamation } from '../../assets/icon/circleExclamation.svg';
import { BaseUrl, checkLinkValidity, UpdateUserPassword } from '../../services/Network';
import { isUserAuthenticated, getLoggedInUser } from '../../helpers/authUtils';
import Input from '../../sharedComponents/form/input/Input';
import { UserStore } from '../../store/UserStore';
import { ComponentStore } from '../../store/ComponentStore';
import Brick from '../../sharedComponents/brick';
import Modal from 'react-bootstrap/Modal';
import Button from '../../sharedComponents/button/Button';
import colorPalette from '../../assets/scss/_colors.scss';
import { Checkbox } from '../../sharedComponents/form/checkbox';
import TermsAndConditions from './terms-conditions/TermsAndConditions';
import { compareStrings, specialChartPattern } from './utils';
import { Notification } from '../../sharedComponents/notification';
import './auth.scss';

const Confirm = (props) => {
    const cookies = new Cookies();
    const history = useHistory();
    const [_isMounted, set_isMounted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [titleText, setTitleText] = useState('Set New Password');
    const [updateStatus, setUpdateStatus] = useState('');
    const [detailMessage, setDetailMessage] = useState('');
    const [isRetry, setRetry] = useState(false);
    const [showReset, setShowReset] = useState(false);
    const [redirectToLogin, setRedirectToLogin] = useState(false);
    const [matchError, setMatchError] = useState(false);
    const [passwordError, setPasswordError] = useState(false);
    const [cpasswordError, setCPasswordError] = useState(false);
    const [password, setPassword] = useState('');
    const [cpassword, setCPassword] = useState('');
    const [passwordType, setPasswordType] = useState('password');
    const [cPasswordType, setCPasswordType] = useState('password');
    const [charErr, setCharErr] = useState('');
    const [lowerCaseErr, setLowerCaseErr] = useState('');
    const [upperCaseErr, setUpperCaseErr] = useState('');
    const [specialCharErr, setSpecialCharErr] = useState('');
    const [numberErr, setNumberErr] = useState('');
    const [matchErr, setMatchErr] = useState('');
    const [alreadyLogin, setAlreadyLogin] = useState(false);
    const [userDetails, setUserDetails] = useState({});
    const [errorCount, setErrorCount] = useState(0);
    const [isTermsAccepted, setTermsAcceptance] = useState(false);
    const [isTermsRead, setTermsRead] = useState(false);

    // Terms and Condition Modal
    const [showModal, setModalShow] = useState(false);
    const handleModalClose = () => setModalShow(false);
    const handleModalOpen = () => setModalShow(true);

    const RequiredFieldUI = ({ className = '' }) => {
        return (
            <span style={{ color: colorPalette.error600 }} className={`font-weight-bold ${className}`}>
                *
            </span>
        );
    };

    useEffect(() => {
        set_isMounted(true);
        setTermsRead(false);
        setTermsAcceptance(false);
        document.body.classList.add('authentication-bg');
        const isAuthTknValid = isUserAuthenticated();
        const user = getLoggedInUser();
        setUserDetails(user);
        if (isAuthTknValid === false) checkLinkValidityFunc();
        else {
            setAlreadyLogin(true);
        }
        return () => {
            set_isMounted(false);
            document.body.classList.remove('authentication-bg');
        };
    }, []);

    const checkLinkValidityFunc = async () => {
        try {
            setIsLoading(true);
            const headers = {
                'Content-Type': 'application/json',
                accept: 'application/json',
                Authorization: `Bearer ${props?.match?.params?.token}`,
            };
            await axios.get(`${BaseUrl}${checkLinkValidity}`, { headers }).then((res) => {
                const response = res?.data;
                if (!response.success) history.push('/account/link-expired');
                setIsLoading(false);
            });
        } catch (error) {
            history.push('/account/link-expired');
            setIsLoading(false);
        }
    };

    const notifyUser = (notifyType, notifyMessage) => {
        UserStore.update((s) => {
            s.showNotification = true;
            s.notificationMessage = notifyMessage;
            s.notificationType = notifyType;
        });
    };

    const handleValidSubmit = async () => {
        let ct = 0;
        if (password === '') {
            setPasswordError(true);
            ct++;
        }
        if (cpassword === '') {
            setCPasswordError(true);
            ct++;
        }
        if (ct === 0) {
            if (password !== cpassword) {
                setMatchError(true);
                return;
            }
            setIsLoading(true);
            const headers = {
                'Content-Type': 'application/json',
                accept: 'application/json',
                Authorization: `Bearer ${props.match.params.token}`,
            };
            await axios
                .post(
                    `${BaseUrl}${UpdateUserPassword}`,
                    {
                        password: password,
                        confirm_password: cpassword,
                        accept_terms: isTermsAccepted,
                    },
                    { headers }
                )
                .then((res) => {
                    const response = res?.data;
                    let message = '';
                    if (response?.success) {
                        setTitleText('Success');
                        message = response?.message ? response?.message : `Password set successfully!`;
                        notifyUser(Notification.Types.success, message);
                        setDetailMessage(`You have successfully set your password. You may now log in to the
                            Sapient Energy Portal.`);
                    } else {
                        setTitleText('Failed');
                        message = response?.message ? response?.message : `Failed to update password.`;
                        notifyUser(Notification.Types.error, message);
                        setDetailMessage(
                            `Password Change Failed: Unfortunately, we were unable to update your password. Please make another attempt or reach out to Administrator for assistance.`
                        );
                    }
                    setUpdateStatus(message);
                    setRetry(false);
                })
                .catch((error) => {
                    const response = error?.response?.data;
                    if (!response?.success) {
                        let message = '';
                        setTitleText('Failed');
                        message = response?.message
                            ? response?.message
                            : `Password Change Failed: Unfortunately, we were unable to update your password. Please make another attempt or reach out to Administrator for assistance.`;
                        notifyUser(Notification.Types.error, `Failed to update password.`);
                        setDetailMessage(message);
                        setUpdateStatus(`Failed to update password.`);
                        setRetry(true);
                    }
                })
                .finally(() => {
                    setIsLoading(false);
                    setShowReset(true);
                });
        }
    };
    const handleAccept = () => {
        setTermsRead(true); // PLT-1703: Temperory disabled the functionality
        setTermsAcceptance(true);
        handleModalClose();
    };

    const handleDecline = () => {
        setTermsAcceptance(false);
        setTermsRead(false);
        handleModalClose();
    };

    useEffect(() => {
        if (redirectToLogin) {
            history.push('/account/login');
        }
    }, [redirectToLogin]);

    useEffect(() => {
        if (password.length >= 2) {
            if (password.length >= 8) {
                setCharErr('success');
            } else {
                setCharErr('error');
            }
            if (password.match(/[A-Z]/)) {
                setUpperCaseErr('success');
            } else {
                setUpperCaseErr('error');
            }
            if (password.match(/[a-z]/)) {
                setLowerCaseErr('success');
            } else {
                setLowerCaseErr('error');
            }
            if (password.match(specialChartPattern)) {
                setSpecialCharErr('success');
            } else {
                setSpecialCharErr('error');
            }
            if (password.match(/[0-9]/)) {
                setNumberErr('success');
            } else {
                setNumberErr('error');
            }
        } else if (password.length === 0) {
            setSpecialCharErr('');
            setNumberErr('');
            setCharErr('');
            setUpperCaseErr('');
            setLowerCaseErr('');
        }
    }, [password]);

    useEffect(() => {
        let ct = 0;
        if (charErr === 'error') {
            ct++;
        }
        if (numberErr === 'error') {
            ct++;
        }
        if (lowerCaseErr === 'error') {
            ct++;
        }
        if (upperCaseErr === 'error') {
            ct++;
        }
        if (specialCharErr === 'error') {
            ct++;
        }
        setErrorCount(ct);
    }, [charErr, numberErr, lowerCaseErr, upperCaseErr, specialCharErr]);

    useEffect(() => {
        compareStrings(password, cpassword) ? setMatchErr(`success`) : setMatchErr(`error`);
    }, [password, cpassword]);

    const handleLogout = () => {
        ComponentStore.update((s) => {
            s.parent = '';
        });
        localStorage.clear();
        cookies.remove('user', { path: '/' });
        window.location.reload();
    };

    const messageLines = detailMessage.split('\n');

    return (
        <React.Fragment>
            {alreadyLogin ? (
                <></>
            ) : (
                <>
                    {_isMounted && (
                        <Holder
                            rightContent={
                                <>
                                    {isLoading && <Loader />}
                                    <Col lg={8}>
                                        <div className="logoContainer">
                                            <a href="/">
                                                <LogoSVG className="logoDesign" />
                                            </a>
                                            <Typography.Header size={Typography.Sizes.sm} className="text-muted">
                                                {titleText}
                                            </Typography.Header>
                                        </div>
                                        {showReset ? (
                                            <>
                                                <Notification
                                                    type={
                                                        titleText === 'Success'
                                                            ? Notification.Types.success
                                                            : Notification.Types.error
                                                    }
                                                    component={Notification.ComponentTypes.alert}
                                                    title={updateStatus}
                                                    isShownCloseBtn={false}
                                                />

                                                <Brick sizeInRem={2} />

                                                <Typography.Subheader size={Typography.Sizes.md} className="text-muted">
                                                    {messageLines.map((line, index) => (
                                                        <p key={index}>{line}</p>
                                                    ))}
                                                </Typography.Subheader>

                                                <Brick sizeInRem={2} />

                                                <FormGroup className={`w-100 ${isRetry ? 'reset-page-btn-style' : ''}`}>
                                                    {isRetry && (
                                                        <Button
                                                            label={'Retry Password Update'}
                                                            size={Button.Sizes.lg}
                                                            type={Button.Type.secondaryGrey}
                                                            className="sub-button"
                                                            onClick={() => {
                                                                setShowReset(false);
                                                                setTitleText('Set New Password');
                                                            }}></Button>
                                                    )}

                                                    <Button
                                                        label={'Go to Login'}
                                                        size={Button.Sizes.lg}
                                                        type={Button.Type.primary}
                                                        className="sub-button"
                                                        onClick={async () => {
                                                            setRedirectToLogin(true);
                                                        }}></Button>
                                                </FormGroup>
                                            </>
                                        ) : (
                                            <>
                                                <form className="authentication-form">
                                                    <FormGroup className="mb-3 pt-2">
                                                        <div className="d-flex">
                                                            <Typography.Subheader
                                                                size={Typography.Sizes.md}
                                                                className="text-mute mb-1">
                                                                Password
                                                            </Typography.Subheader>
                                                            <RequiredFieldUI className="ml-1" />
                                                        </div>
                                                        <Input
                                                            placeholder="Enter your password"
                                                            type={passwordType}
                                                            error={
                                                                errorCount > 1
                                                                    ? 'Please correct the errors'
                                                                    : errorCount === 1 && charErr === 'error'
                                                                    ? 'You must have a character'
                                                                    : errorCount === 1 && numberErr === 'error'
                                                                    ? 'You must have a number'
                                                                    : errorCount === 1 && specialCharErr === 'error'
                                                                    ? 'You must have a special character'
                                                                    : errorCount === 1 && upperCaseErr === 'error'
                                                                    ? 'You must have a upper case character'
                                                                    : errorCount === 1 && lowerCaseErr === 'error'
                                                                    ? 'You must have a lower case character'
                                                                    : null
                                                            }
                                                            elementEnd={
                                                                passwordType === 'password' ? (
                                                                    <EyeSVG
                                                                        onClick={() => {
                                                                            setPasswordType('text');
                                                                        }}
                                                                    />
                                                                ) : (
                                                                    <EyeSlashSVG
                                                                        onClick={() => {
                                                                            setPasswordType('password');
                                                                        }}
                                                                    />
                                                                )
                                                            }
                                                            onChange={(e) => {
                                                                setPassword(e.target.value.trim());
                                                            }}
                                                            labelSize={Typography.Sizes.md}
                                                            value={password}
                                                        />
                                                    </FormGroup>
                                                    <div className="columnField ml-3">
                                                        <div className="rowField">
                                                            <div className="mr-2">
                                                                {charErr == '' ? (
                                                                    <CheckMinusMark
                                                                        className="mt-2"
                                                                        style={{ height: '1.2rem', width: '1.2rem' }}
                                                                    />
                                                                ) : charErr === 'success' ? (
                                                                    <Check
                                                                        className="mt-2"
                                                                        style={{ height: '1.2rem', width: '1.2rem' }}
                                                                    />
                                                                ) : (
                                                                    <CheckXmark
                                                                        className="mt-2"
                                                                        style={{ height: '1.2rem', width: '1.2rem' }}
                                                                    />
                                                                )}
                                                            </div>
                                                            <div>
                                                                {charErr === 'error' ? (
                                                                    <Typography.Subheader
                                                                        size={Typography.Sizes.md}
                                                                        className="text-mute-error mt-2">
                                                                        Error: 8 or more characters
                                                                    </Typography.Subheader>
                                                                ) : (
                                                                    <Typography.Subheader
                                                                        size={Typography.Sizes.md}
                                                                        className="text-mute mt-2">
                                                                        8 or more characters
                                                                    </Typography.Subheader>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="rowField">
                                                            <div className="mr-2">
                                                                {upperCaseErr == '' ? (
                                                                    <CheckMinusMark
                                                                        className="mt-2"
                                                                        style={{ height: '1.2rem', width: '1.2rem' }}
                                                                    />
                                                                ) : upperCaseErr === 'success' ? (
                                                                    <Check
                                                                        className="mt-2"
                                                                        style={{ height: '1.2rem', width: '1.2rem' }}
                                                                    />
                                                                ) : (
                                                                    <CheckXmark
                                                                        className="mt-2"
                                                                        style={{ height: '1.2rem', width: '1.2rem' }}
                                                                    />
                                                                )}
                                                            </div>
                                                            <div>
                                                                {upperCaseErr === 'error' ? (
                                                                    <Typography.Subheader
                                                                        size={Typography.Sizes.md}
                                                                        className="text-mute-error mt-2">
                                                                        Error: Upper case letter (1 or more)
                                                                    </Typography.Subheader>
                                                                ) : (
                                                                    <Typography.Subheader
                                                                        size={Typography.Sizes.md}
                                                                        className="text-mute mt-2">
                                                                        Upper case letter (1 or more)
                                                                    </Typography.Subheader>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="rowField">
                                                            <div className="mr-2">
                                                                {lowerCaseErr == '' ? (
                                                                    <CheckMinusMark className="mt-2 checkError" />
                                                                ) : lowerCaseErr === 'success' ? (
                                                                    <Check className="mt-2 checkError" />
                                                                ) : (
                                                                    <CheckXmark className="mt-2 checkError" />
                                                                )}
                                                            </div>
                                                            <div>
                                                                {lowerCaseErr === 'error' ? (
                                                                    <Typography.Subheader
                                                                        size={Typography.Sizes.md}
                                                                        className="text-mute-error mt-2">
                                                                        Error: Lower case letter (1 or more)
                                                                    </Typography.Subheader>
                                                                ) : (
                                                                    <Typography.Subheader
                                                                        size={Typography.Sizes.md}
                                                                        className="text-mute mt-2">
                                                                        Lower case letter (1 or more)
                                                                    </Typography.Subheader>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="rowField">
                                                            <div className="mr-2">
                                                                {specialCharErr == '' ? (
                                                                    <CheckMinusMark
                                                                        className="mt-2"
                                                                        style={{ height: '1.2rem', width: '1.2rem' }}
                                                                    />
                                                                ) : specialCharErr === 'success' ? (
                                                                    <Check
                                                                        className="mt-2"
                                                                        style={{ height: '1.2rem', width: '1.2rem' }}
                                                                    />
                                                                ) : (
                                                                    <CheckXmark
                                                                        className="mt-2"
                                                                        style={{ height: '1.2rem', width: '1.2rem' }}
                                                                    />
                                                                )}
                                                            </div>
                                                            <div>
                                                                {specialCharErr === 'error' ? (
                                                                    <Typography.Subheader
                                                                        size={Typography.Sizes.md}
                                                                        className="text-mute-error mt-2">
                                                                        {`Error: Special characters (one or more) allowed: ~\!?@#\$%\^&\*\(\)_\+{}\":;.,='\[\]`}
                                                                    </Typography.Subheader>
                                                                ) : (
                                                                    <Typography.Subheader
                                                                        size={Typography.Sizes.md}
                                                                        className="text-mute mt-2">
                                                                        {`Special Character (1 or more)`}
                                                                    </Typography.Subheader>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="rowField">
                                                            <div className="mr-2">
                                                                {numberErr == '' ? (
                                                                    <CheckMinusMark
                                                                        className="mt-2"
                                                                        style={{ height: '1.2rem', width: '1.2rem' }}
                                                                    />
                                                                ) : numberErr === 'success' ? (
                                                                    <Check
                                                                        className="mt-2"
                                                                        style={{ height: '1.2rem', width: '1.2rem' }}
                                                                    />
                                                                ) : (
                                                                    <CheckXmark
                                                                        className="mt-2"
                                                                        style={{ height: '1.2rem', width: '1.2rem' }}
                                                                    />
                                                                )}
                                                            </div>
                                                            <div>
                                                                {numberErr === 'error' ? (
                                                                    <Typography.Subheader
                                                                        size={Typography.Sizes.md}
                                                                        className="text-mute-error mt-2">
                                                                        Error: Number (1 or more)
                                                                    </Typography.Subheader>
                                                                ) : (
                                                                    <Typography.Subheader
                                                                        size={Typography.Sizes.md}
                                                                        className="text-mute mt-2">
                                                                        Number (1 or more)
                                                                    </Typography.Subheader>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <FormGroup className="mb-3 pt-5">
                                                        <div className="d-flex">
                                                            <Typography.Subheader
                                                                size={Typography.Sizes.md}
                                                                className="text-mute mb-1">
                                                                Confirm Password
                                                            </Typography.Subheader>
                                                            <RequiredFieldUI className="ml-1" />
                                                        </div>
                                                        <Input
                                                            placeholder="Enter your password"
                                                            disabled={
                                                                charErr === 'error' ||
                                                                lowerCaseErr === 'error' ||
                                                                upperCaseErr === 'error' ||
                                                                specialCharErr === 'error' ||
                                                                numberErr === 'error' ||
                                                                password === ''
                                                                    ? true
                                                                    : false
                                                            }
                                                            type={cPasswordType}
                                                            error={
                                                                cpasswordError ? 'Confirm Password is Required' : null
                                                            }
                                                            elementEnd={
                                                                cPasswordType === 'password' ? (
                                                                    <EyeSVG
                                                                        onClick={() => {
                                                                            setCPasswordType('text');
                                                                        }}
                                                                    />
                                                                ) : (
                                                                    <EyeSlashSVG
                                                                        onClick={() => {
                                                                            setCPasswordType('password');
                                                                        }}
                                                                    />
                                                                )
                                                            }
                                                            onChange={(e) => {
                                                                setCPassword(e.target.value.trim());
                                                            }}
                                                            labelSize={Typography.Sizes.md}
                                                            value={cpassword}
                                                        />
                                                    </FormGroup>
                                                    <div className="columnField ml-3">
                                                        <div className="rowField">
                                                            <div className="mr-2">
                                                                {cpassword === '' ? (
                                                                    <CheckMinusMark
                                                                        className="mt-2"
                                                                        style={{ height: '1.2rem', width: '1.2rem' }}
                                                                    />
                                                                ) : (
                                                                    <>
                                                                        {matchErr === 'success' ? (
                                                                            <Check
                                                                                className="mt-2"
                                                                                style={{
                                                                                    height: '1.2rem',
                                                                                    width: '1.2rem',
                                                                                }}
                                                                            />
                                                                        ) : (
                                                                            <CheckXmark
                                                                                className="mt-2"
                                                                                style={{
                                                                                    height: '1.2rem',
                                                                                    width: '1.2rem',
                                                                                }}
                                                                            />
                                                                        )}
                                                                    </>
                                                                )}
                                                            </div>
                                                            <div>
                                                                <Typography.Subheader
                                                                    size={Typography.Sizes.md}
                                                                    className={`mt-2 ${
                                                                        matchErr === 'error' && cpassword !== ''
                                                                            ? `text-mute-error`
                                                                            : `text-mute`
                                                                    }`}>
                                                                    {matchErr === 'error' && cpassword !== ''
                                                                        ? `Error: Password must match`
                                                                        : `Password must match`}
                                                                </Typography.Subheader>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Terms and Condition  */}
                                                    <div className="mt-4 d-flex align-items-center">
                                                        <Checkbox
                                                            label=""
                                                            size={Checkbox.Sizes.md}
                                                            checked={isTermsAccepted}
                                                            onClick={() => {
                                                                setTermsAcceptance(!isTermsAccepted);
                                                            }}
                                                            // disabled={!isTermsRead} // PLT-1703: Temperory disabled the functionality
                                                        />
                                                        <Typography.Body size={Typography.Sizes.lg}>
                                                            <div
                                                                className="d-flex align-items-center"
                                                                style={{ gap: '0.2rem' }}>
                                                                <RequiredFieldUI />
                                                                <div>{`I have read and agree to the`}</div>
                                                                <div
                                                                    className="model-text-style mouse-pointer"
                                                                    onClick={
                                                                        handleModalOpen
                                                                    }>{`terms of service.`}</div>
                                                            </div>
                                                        </Typography.Body>
                                                    </div>

                                                    <FormGroup className="mb-3 mt-4">
                                                        <Button
                                                            className="sub-button"
                                                            label={'Set Password'}
                                                            size={Button.Sizes.lg}
                                                            type={Button.Type.primary}
                                                            onClick={handleValidSubmit}
                                                            disabled={
                                                                matchErr === 'success' &&
                                                                charErr === 'success' &&
                                                                lowerCaseErr === 'success' &&
                                                                upperCaseErr === 'success' &&
                                                                specialCharErr === 'success' &&
                                                                numberErr === 'success' &&
                                                                isTermsAccepted
                                                                    ? false
                                                                    : true
                                                            }></Button>
                                                    </FormGroup>
                                                </form>
                                            </>
                                        )}
                                    </Col>
                                </>
                            }
                        />
                    )}
                </>
            )}
            <Modal
                show={alreadyLogin}
                onHide={() => {
                    setAlreadyLogin(false);
                }}
                centered
                backdrop="static"
                dialogClassName="alert-login-style"
                keyboard={false}>
                <Modal.Body className="p-4">
                    <Typography.Header size={Typography.Sizes.lg}>Already Logged In</Typography.Header>
                    <Brick sizeInRem={1} />
                    <div className="errorBlock">
                        <Row>
                            <Col lg={1}>
                                <Exclamation />
                            </Col>
                            <Col lg={10}>
                                <Typography.Subheader size={Typography.Sizes.md} className="errorText">
                                    {userDetails?.email}
                                </Typography.Subheader>
                                <Typography.Subheader size={Typography.Sizes.md} className="errorText">
                                    is currently logged in.
                                </Typography.Subheader>
                            </Col>
                        </Row>
                    </div>
                    <Brick sizeInRem={1} />
                    <Typography.Body size={Typography.Sizes.lg}>
                        &nbsp;&nbsp;Log out to proceed with new user setup?
                    </Typography.Body>
                </Modal.Body>
                <Modal.Footer className="find-footer">
                    <Button
                        label="Cancel"
                        size={Button.Sizes.lg}
                        type={Button.Type.secondaryGrey}
                        onClick={() => {
                            setAlreadyLogin(false);
                            history.push('/');
                        }}
                        className="btn-width"
                    />

                    <Button
                        label={'Log Out'}
                        size={Button.Sizes.lg}
                        type={Button.Type.primary}
                        onClick={() => {
                            setAlreadyLogin(false);
                            handleLogout();
                        }}
                        className="btn-width"
                    />
                </Modal.Footer>
            </Modal>

            <TermsAndConditions
                showModal={showModal}
                closeModal={handleModalClose}
                handleAccept={handleAccept}
                handleDecline={handleDecline}
            />
        </React.Fragment>
    );
};

export default connect()(Confirm);
