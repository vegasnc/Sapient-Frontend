import React, { useState, useEffect } from 'react';
import { Col, FormGroup, Alert, Row } from 'reactstrap';
import Loader from '../../components/Loader';
import Holder from './Holder';
import { connect } from 'react-redux';
import { Cookies } from 'react-cookie';
import Typography from '../../sharedComponents/typography';
import './auth.scss';
import { ReactComponent as LogoSVG } from '../../assets/icon/Logo1.svg';
import { ReactComponent as CircleCheckSVG } from '../../assets/icon/circle-check.svg';
import Button from '../../sharedComponents/button/Button';
import { useHistory } from 'react-router-dom';
import { fetchSessionDetails, updateUser } from './service';
import { googleLoginUser } from '../../redux/actions';

const AuthUpdate = (props) => {
    let history = useHistory();
    const [_isMounted, set_isMounted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [titleText, setTitleText] = useState('Success');

    const setSession = (user) => {
        let cookies = new Cookies();
        if (user) {
            localStorage.setItem('vendorName', user?.vendor_name);
            localStorage.setItem('vendorId', user?.vendor_id);
            cookies.set('user', JSON.stringify(user), { path: '/' });
        } else cookies.remove('user', { path: '/' });
    };

    useEffect(() => {
        set_isMounted(true);
        document.body.classList.add('authentication-bg');

        return () => {
            set_isMounted(false);
            document.body.classList.remove('authentication-bg');
        };
    }, []);

    const fetchSession = async () => {
        setIsLoading(true);
        let sessionId = localStorage.getItem('session-id');
        let params = `?session_id=${sessionId}`;
        await fetchSessionDetails(params)
            .then(async (res) => {
                let response = res.data;

                setSession(response.data);
                await updateUserDetails();
                setIsLoading(false);
                history.push('/');
            })
            .catch((error) => {
                setIsLoading(false);
            });
    };

    const updateUserDetails = async () => {
        let payload = {
            linked_oauth: ['google'],
        };
        await updateUser(payload)
            .then((res) => {
                let response = res.data;
            })
            .catch((error) => {});
    };

    return (
        <React.Fragment>
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

                                <>
                                    <Alert color="success" className="alertPop" isOpen={true}>
                                        <div>
                                            <Typography.Subheader size={Typography.Sizes.md} className="alertText">
                                                <CircleCheckSVG
                                                    className="ml-2 mr-2"
                                                    style={{ marginRight: '4px', color: 'green' }}
                                                />
                                                Acount Found
                                            </Typography.Subheader>
                                        </div>
                                    </Alert>
                                    <Typography.Subheader size={Typography.Sizes.md} className="text-mute mt-4">
                                        We found an account associated with this email. Would you like to manage the
                                        existing account with Google Authentication?
                                    </Typography.Subheader>
                                    <FormGroup className="form-group mt-5 pt-4 mb-0 text-center">
                                        <Row>
                                            <Col>
                                                <Button
                                                    className="sub-button"
                                                    type={Button.Type.secondaryGrey}
                                                    size={Button.Sizes.md}
                                                    onClick={() => {
                                                        history.push('/account/login');
                                                    }}
                                                    label="No"></Button>
                                            </Col>
                                            <Col>
                                                <Button
                                                    className="sub-button"
                                                    type={Button.Type.primary}
                                                    size={Button.Sizes.md}
                                                    onClick={() => {
                                                        fetchSession();
                                                    }}
                                                    label="Yes"></Button>
                                            </Col>
                                        </Row>
                                    </FormGroup>
                                </>
                            </Col>
                        </>
                    }
                />
            )}
        </React.Fragment>
    );
};

export default AuthUpdate;
