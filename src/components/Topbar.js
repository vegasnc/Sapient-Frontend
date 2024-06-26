import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Container } from 'reactstrap';
import { Menu, X, Settings, User, HelpCircle, Lock, LogOut } from 'react-feather';

import { showRightSidebar } from '../redux/actions';

import logo from '../assets/images/logo.png';

const Notifications = [
    {
        id: 1,
        text: 'New user registered',
        subText: '1 min ago',
        icon: 'uil uil-user-plus',
        bgColor: 'primary',
    },
    {
        id: 2,
        text: 'Karen Robinson',
        subText: 'Wow ! this admin looks good and awesome design',
        icon: 'uil uil-comment-message',
        bgColor: 'success',
    },
    {
        id: 3,
        text: 'Cristina Pride',
        subText: 'Hi, How are you? What about our next meeting',
        icon: 'uil uil-comment-message',
        bgColor: 'danger',
    },
    {
        id: 4,
        text: 'New user registered',
        subText: '1 day ago',
        icon: 'uil uil-user-plus',
        bgColor: 'info',
    },
];

const ProfileMenus = [
    {
        label: 'My Account',
        icon: User,
        redirectTo: '/',
    },
    {
        label: 'Settings',
        icon: Settings,
        redirectTo: '/',
    },
    {
        label: 'Support',
        icon: HelpCircle,
        redirectTo: '/',
    },
    {
        label: 'Lock Screen',
        icon: Lock,
        redirectTo: '/',
    },
    {
        label: 'Logout',
        icon: LogOut,
        redirectTo: '/account/logout',
        hasDivider: true,
    },
];

class Topbar extends Component {
    constructor(props) {
        super(props);

        this.handleRightSideBar = this.handleRightSideBar.bind(this);
    }

    /**
     * Toggles the right sidebar
     */
    handleRightSideBar = () => {
        this.props.showRightSidebar();
    };

    render() {
        return (
            <React.Fragment>
                <div className="navbar navbar-expand flex-column flex-md-row navbar-custom">
                    <Container fluid>
                        {/* logo */}
                        <Link to="/" className="navbar-brand mr-0 mr-md-2 logo">
                            <span className="logo-lg">
                                {/* <img src={logo} alt="" height="24" /> */}
                                <span className="d-inline h5 ml-2 text-logo">Sapient</span>
                            </span>
                            <span className="logo-sm">
                                <img src={logo} alt="" height="24" />
                            </span>
                        </Link>

                        {/* menu*/}
                        <ul className="navbar-nav bd-navbar-nav flex-row list-unstyled menu-left mb-0">
                            <li className="">
                                <button
                                    className="button-menu-mobile open-left disable-btn"
                                    onClick={this.props.openLeftMenuCallBack}>
                                    <Menu className="menu-icon" />
                                    <X className="close-icon" />
                                </button>
                            </li>
                        </ul>

                        <ul className="navbar-nav flex-row ml-auto d-flex list-unstyled topnav-menu float-right mb-0">
                            <li className="notification-list">
                                <button
                                    className="btn btn-link nav-link right-bar-toggle"
                                    onClick={(e) => {
                                        {
                                            /*this.handleRightSideBar*/
                                        }
                                    }}>
                                    <Settings />
                                    <User className="ml-2" />
                                </button>
                            </li>
                        </ul>
                    </Container>
                </div>
            </React.Fragment>
        );
    }
}

export default connect(null, { showRightSidebar })(Topbar);
