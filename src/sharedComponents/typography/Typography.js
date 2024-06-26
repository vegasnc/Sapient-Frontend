import React from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';

import { TypographyHeader } from './TypographyHeader';
import TypographySubheader from './TypographySubheader';
import { TypographyBody } from './TypographyBody';
import { TypographyLink } from './TypographyLink';

import './style.scss';

const FONT_WEIGHT_TYPES = Object.freeze({
    SemiBold: 'SemiBold',
    Bold: 'Bold',
    Regular: 'Regular',
    Light: 'Light',
    Medium: 'Medium',
});

const SIZES = Object.freeze({
    xxl: 'xxl',
    xl: 'xl',
    lg: 'lg',
    md: 'md',
    sm: 'sm',
    xs: 'xs',
    xxs: 'xxs',
});

const Typography = ({
    children,
    variant,
    size,
    fontWeight,
    className,
    noPadding,
    as = 'div',
    innerRef,
    ...props
}) => {
    const elementClassNames = cx(
        'typography-wrapper',
        variant,
        {
            [`${size}`]: !!size,
        },
        className
    );

    const classNames = cx(
        {
            [`${fontWeight}`]: !!fontWeight,
            ['no-padding']: noPadding,
        },
        elementClassNames
    );
    return React.createElement(as, { className: classNames, ref: innerRef, ...props }, children);
};

Typography.Types = FONT_WEIGHT_TYPES;
Typography.Sizes = SIZES;

Typography.Header = TypographyHeader;
Typography.Subheader = TypographySubheader;
Typography.Body = TypographyBody;
Typography.Link = TypographyLink;

Typography.propTypes = {
    variant: PropTypes.string.isRequired,
    href: PropTypes.string,
    size: PropTypes.oneOf(Object.values(SIZES)),
    fontWeight: PropTypes.oneOf(Object.values(FONT_WEIGHT_TYPES)),
    as: PropTypes.string,
};

export default Typography;
