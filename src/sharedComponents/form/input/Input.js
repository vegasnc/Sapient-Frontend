import React from 'react';
import FormControl from 'react-bootstrap/FormControl';
import PropTypes from 'prop-types';
import cx from 'classnames';
import colorPalette from '../../../assets/scss/_colors.scss';

import Typography from '../../typography';
import Brick from '../../brick';

import { ReactComponent as ErrorSVG } from '../../assets/icons/errorInfo.svg';

import './Input.scss';

const Input = ({ iconUrl, elementEnd, inputClassName = '', className = '', disabled, ...props }) => {
    const inputWrapperClassNames = cx('input-wrapper', className, {
        'element-end': !!elementEnd,
        disabled,
        error: !!props.error,
        icon: !!iconUrl,
    });

    return (
        <div className={inputWrapperClassNames}>
            {props.label && (
                <>
                    <Typography.Body size={Typography.Sizes.sm} className="gray-550 font-weight-medium">
                        {props.label}
                        {props?.required && (
                            <span style={{ color: colorPalette.error700 }} className="font-weight-bold ml-1">
                                *
                            </span>
                        )}
                    </Typography.Body>
                    <Brick sizeInRem={0.25} />
                </>
            )}

            <div className="input-inner-wrapper">
                {iconUrl && <img className="input-icon" src={iconUrl} />}
                <FormControl {...props} disabled={disabled} className={`input-control ${inputClassName}`} />
                {elementEnd &&
                    !props.error &&
                    React.cloneElement(elementEnd, {
                        className: 'element-end-node',
                    })}
                {!!props.error && <ErrorSVG className="element-end-node" />}
            </div>

            {!!props.error && (
                <>
                    <Brick sizeInRem={0.375} />
                    <Typography.Body size={Typography.Sizes.xs} className="input-error-label">
                        {props.error}
                    </Typography.Body>
                </>
            )}
        </div>
    );
};

Input.propTypes = {
    iconUrl: PropTypes.string,
    elementEnd: PropTypes.node,
    required: PropTypes.bool,
    error: PropTypes.string,
    label: PropTypes.string,
};

export default Input;
