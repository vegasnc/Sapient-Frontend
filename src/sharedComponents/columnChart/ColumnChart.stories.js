import React from 'react';
import moment from 'moment';

import ColumnChart from './ColumnChart';
import { UNITS } from '../../constants/units';

import '../assets/scss/stories.scss';
import colors from '../../assets/scss/_colors.scss';

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
    colors: [colors.datavizMain1, colors.datavizMain2],
    xAxisCallBackValue: ({ value }) => {
        return moment(value).format('MM/DD H:00 A');
    },
    //callback to tooltip header
    // tooltipCallBackValue: ({value}) => {
    //     return  moment(value).format(`MMM D 'YY @ hh:mm A`);
    // },

    // You can overwrite base config we used for chart, pls refer to Official Highcharts doc.
    // restChartProps: {
    //     xAxis: {
    //         labels: {
    //             enabled: false,
    //         },
    //     },
    // },

    //Categories should be timestamps
    categories: [
        '2022-11-28T00:30:00+00:00',
        '2022-11-28T01:30:00+00:00',
        '2022-11-28T02:30:00+00:00',
        '2022-11-28T04:30:00+00:00',
        '2022-11-28T05:30:00+00:00',
        '2022-11-28T06:30:00+00:00',
        '2022-11-28T07:30:00+00:00',
        '2022-11-28T08:30:00+00:00',
    ],
    tooltipUnit: UNITS.KWH,
    series: [
        {
            name: 'HVAC',
            data: [13.93, 13.63, 13.73, 13.67, 14.37, 14.89, 14.56, 14.32],
        },
        {
            name: 'AVSC',
            data: [12.24, 12.24, 11.95, 12.02, 11.65, 11.96, 11.59, 11.94],
        },
    ],
};
