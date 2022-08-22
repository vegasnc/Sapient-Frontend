import React from 'react';
import ReactSelect, { components } from 'react-select';
import PropTypes from 'prop-types';
import cx from 'classnames';

import MultiSelect from './MultiSelect';

import { ReactComponent as CaretDownIcon } from '../../assets/icons/caretDown.svg';

import './style.scss';

const conditionalClass = props => (props.selectProps.menuIsOpen ? 'is-open' : 'is-closed');

const Option = props => {
    const { isDisabled, isSelected, isFocused, children } = props;
    const { customOption } = props.selectProps;

    const className = cx('react-select-option', {
        'react-select-option--is-disabled': isDisabled,
        'react-select-option--is-focused': isFocused,
        'react-select-option--is-selected': isSelected,
        customOption: !!customOption,
    });

    return !isDisabled ? (
        <components.Option {...props} className={className}>
            {!!customOption ? React.cloneElement(customOption, { className }, children) : children}
        </components.Option>
    ) : null;
};

const DropdownIndicator = props => (
    <components.DropdownIndicator {...props}>
        <CaretDownIcon className={conditionalClass(props)} />
    </components.DropdownIndicator>
);

const Control = ({ children, ...props }) => (
    <components.Control {...props} className={conditionalClass(props)}>
        {children}
    </components.Control>
);

const Select = ({ selectClassName = '', className = '', options = [], defaultValue, ...props }) => {
    const selectedOption = options.find(({ value }) => value === defaultValue);

    return (
        <div className={`react-select-wrapper ${className}`}>
            <ReactSelect
                {...props}
                options={options}
                defaultValue={selectedOption}
                components={{ DropdownIndicator, Control, Option }}
                className={selectClassName}
            />
        </div>
    );
};

Select.MultiSelect = MultiSelect;

Select.propTypes = {
    defaultValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    options: PropTypes.arrayOf(
        PropTypes.shape({
            label: PropTypes.string.isRequired,
            value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        })
    ).isRequired,
    customOption: PropTypes.node,
};

export default Select;
