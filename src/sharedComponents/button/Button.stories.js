import React from 'react';

import Button from './Button';
import Brick from '../brick';

import { ReactComponent as PlusSVG } from '../assets/icons/plus.svg';

import '../assets/scss/stories.scss';
import { ButtonTertiary } from './ButtonTertiary';

export default {
    title: 'Components/Button',
    component: Button,
};

export const SecondaryGrey = () => (
    <>
        <h6>Without Icon</h6>
        <Button label="Button CTA {MD}" size={Button.Sizes.md} type={Button.Type.secondaryGrey} />
        <Brick />
        <Button label={'Button CTA {SM}'} size={Button.Sizes.sm} type={Button.Type.secondaryGrey} />

        <Brick sizeInRem={2} />

        <h6>With Icon - Aligned to Left/Right</h6>
        <div className="d-flex">
            <Button
                label="Button CTA {MD}"
                size={Button.Sizes.md}
                type={Button.Type.secondaryGrey}
                icon={<PlusSVG />}
            />
            <div className="p-2" />
            <Button
                label="Button CTA {MD}"
                size={Button.Sizes.md}
                type={Button.Type.secondaryGrey}
                icon={<PlusSVG />}
                iconAlignment={Button.IconAlignment.right}
            />
        </div>
    </>
);

export const Primary = () => <Button label="Button CTA {LG}" size={Button.Sizes.lg} type={Button.Type.primary} />;

export const tertiary = () => <ButtonTertiary label="Button {tertiary} CTA {LG}" size={Button.Sizes.lg} type={Button.Type.tertiary} />;