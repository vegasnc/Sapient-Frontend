import React from 'react';
import PropTypes from 'prop-types';
import Typography from '../typography';
import cx from 'classnames';

import './Badge.scss';

export default function Badge({ text = '', ...props }) {
    return (
        text && (
            <div className={cx('badge-wrapper', props.className)}>
                <Typography.Body size={Typography.Sizes.sm} className={cx('Medium', props.typographyClassName)}>
                    {text}
                </Typography.Body>
            </div>
        )
    );
}

Badge.propTypes = {
    text: PropTypes.string.isRequired,
    typographyClassName: PropTypes.string,
};
