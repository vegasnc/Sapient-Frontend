import React from 'react';
import './ExploreChart.scss';
import { colorPalette } from './utils';
import Highcharts from 'highcharts/highstock';

import HighchartsReact from 'highcharts-react-official';
import Typography from '../typography';
require('highcharts/modules/exporting')(Highcharts);

const ExploreChart = (props) => {
    const { data, title, subTitle } = props;

    const preparedData = data.map((el, index) => {
        return {
            type: 'line',
            color: colorPalette[index],
            data: el,
            lineWidth: 2,
            showInLegend: true,
        };
    });

    const options = {
        chart: {
            type: 'spline',
            animation: {
                duration: 1000,
            },
        },
        credits: {
            enabled: false,
        },
        legend: {
            enabled: true,
            floating: true,
            align: 'right',
            verticalAlign: 'top',
            y: 0,
            x: 0,
            labelFormat: '<span style="color:{color}">{name}</span><br/>',
            borderWidth: 0,
            itemStyle: {
                color: '#333333',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 'normal',
                textOverflow: 'ellipsis',
                textTransform: 'capitalize',
            },
        },
        navigator: {
            enabled: true,
        },
        exporting: {
            enable: true,
        },
        plotOptions: {
            series: {
                marker: {
                    symbol: 'circle',
                    lineWidth: 1,
                },
                shadow: true,
            },
        },
        tooltip: {
            style: {
                fontWeight: 'normal',
            },
            snap: 0,
            backgroundColor: 'white',
            borderRadius: 8,
            borderColor: '#8098F9',
            useHTML: true,
            padding: 10,
            border: 1,
            animation: true,
            split: false,
            shared: true,
        },
        rangeSelector: {
            selected: 1,
        },

        scrollbar: {
            enabled: false,
        },

        xAxis: {
            lineWidth: 1,
            gridLineWidth: 1,
            alternateGridColor: '#F2F4F7',
            type: 'datetime',
            labels: {
                format: '{value: %e %b %Y}',
            },
        },
        yAxis: {
            series:[...preparedData],
            gridLineWidth: 1,
            lineWidth: 1,

            accessibility: {
                enabled: true,
            },
            labels: {
                format: '{value}',
            },
        },
        time: {
            useUTC: false,
        },
        series: [...preparedData],
    };

    return (
        <div className="explore-chart-wrapper">
            <div className="chart-header">
                <Typography size={Typography.Sizes.sm} fontWeight={Typography.Types.SemiBold}>
                    {title}
                </Typography>
                <Typography>{subTitle}</Typography>
            </div>
            <HighchartsReact highcharts={Highcharts} constructorType={'stockChart'} options={options} />
        </div>
    );
};

export default ExploreChart;