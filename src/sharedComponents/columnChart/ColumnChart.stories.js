import React from 'react';

import ColumnChart from './ColumnChart';
import { UNITS } from '../../constants/units';

import '../assets/scss/stories.scss';

export default {
    title: 'Charts/ColumnChart',
    component: ColumnChart,
};

export const Default = (args) => <ColumnChart {...args} />;

Default.args = {
    style: { width: 800 },
    title: 'Chart title',
    subTitle: 'Sub title',
    onMoreDetail: () => alert(),
    colors: ['#B863CF', '#5E94E4'],
    categories: ['0', '2', '4', '6', '8', '9', '10', '12', '14', '16', '18', '30'],
    tooltipUnit: UNITS.KWH,
    series: [
        {
            name: 'HVAC',
            data: [13.93, 13.63, 13.73, 13.67, 14.37, 14.89, 14.56, 14.32, 14.13, 13.93, 13.21, 22.16],
        },
        {
            name: 'AVSC',
            data: [12.24, 12.24, 11.95, 12.02, 11.65, 11.96, 11.59, 11.94, 11.96, 11.59, 11.42, 11.76],
        },
    ],
};