import React from 'react';
import moment from 'moment';

import ColumnLineChart from './ColumnLineChart';
import { UNITS } from '../../constants/units';
import LineChart from '../lineChart/LineChart';
import { LOW_MED_HIGH_TYPES } from '../common/charts/modules/contants';
import '../assets/scss/stories.scss';
import colors from '../../assets/scss/_colors.scss';

export default {
    title: 'Charts/ColumnLineChart',
    component: ColumnLineChart,
};

const config = {
    style: { width: 850 },
    title: 'Chart title',
    subTitle: 'Sub title',
    onMoreDetail: () => alert(),
    colors: [colors.datavizMain1, colors.datavizMain2],
    xAxisCallBackValue: ({ value }) => {
        return moment(value).format('MM/DD H:00 A');
    },

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
    temperatureSeries: [
        {
            type: LOW_MED_HIGH_TYPES.HIGH,
            data: [52, 68, 90, 80, 85, 80, 92, 88],
            color: colors.datavizRed500,
        },
        {
            type: LOW_MED_HIGH_TYPES.MED,
            data: [47, 65, 85, 75, 82, 75, 89, 85],
            color: colors.primaryGray450,
        },
        {
            type: LOW_MED_HIGH_TYPES.LOW,
            data: [43, 62, 80, 70, 80, 70, 85, 83],
            color: colors.datavizBlue400,
        },
    ],
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
    plotBands: [
        {
            type: LineChart.PLOT_BANDS_TYPE.after_hours,
            from: 3,
            to: 3.2,
        },

        {
            type: LineChart.PLOT_BANDS_TYPE.after_hours,
            from: 5,
            to: 6,
        },
    ],
    upperLegendsProps: {
        weather: {
            onClick: ({ event, props, withTemp }) => {
                alert(withTemp);
            },

            // Will be shown even we don't have data for "temperatureSeries"
            // In case we didn't fetch the data so far, and we want fetch it once user clicked in the legend.
            // It has been made porposly to avoid additional not required API call execution.
            isAlwaysShown: true,
        },
        plotBands: {
            onClick: alert,
        },
    },
    // Not necessary, merely for demo purposes
    tooltipValuesKey: '{point.y:.1f}',
};

export const Default = (args) => <ColumnLineChart {...args} temperatureSeries={null} plotBands={null} />;
Default.args = config;

export const WithTemp = (args) => <ColumnLineChart {...args} withTemp={false} />;
WithTemp.args = config;
