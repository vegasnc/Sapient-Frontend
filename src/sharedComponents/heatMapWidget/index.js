import React, { useState, useEffect } from 'react';
import moment from 'moment';
import 'moment-timezone';
import Typography from '../typography';
import PropTypes from 'prop-types';
import { Spinner } from 'reactstrap';
import { formatConsumptionValue } from '../../helpers/helpers';
import { xaxisFilters } from '../../helpers/helpers';
import HeatMapChart from '../../../src/pages/charts/HeatMapChart';
import './style.scss';

const HeatMapWidget = ({
    className = '',
    title,
    subtitle,
    height = 125,
    isAvgConsumptionDataLoading,
    weekDaysOptions,
    weekDaysSeries,
    weekEndsOptions,
    weekEndsSeries,
    startEndDayCount,
    timeZone,
}) => {
    const [configBarChartWidget, setConfigBarChartWidget] = useState({
        chart: {
            type: 'bar',
            height: 350,
            toolbar: {
                show: true,
            },
            zoom: {
                enabled: false,
            },
            animations: {
                enabled: false,
            },
        },
        stroke: {
            width: 0.2,
            show: true,
            curve: 'straight',
        },
        dataLabels: {
            enabled: true,
            enabledOnSeries: [1],
        },
        tooltip: {
            //@TODO NEED?
            // enabled: false,
            shared: false,
            intersect: false,
            style: {
                fontSize: '12px',
                fontFamily: 'Inter, Arial, sans-serif',
                fontWeight: 600,
                cssClass: 'apexcharts-xaxis-label',
            },
            marker: {
                show: false,
            },
            custom: function ({ series, seriesIndex, dataPointIndex, w }) {
                const { seriesX } = w.globals;
                const timestamp = seriesX[seriesIndex][dataPointIndex];
                let ch = '';
                if (isNaN(parseInt(series[seriesIndex][dataPointIndex])) === false) {
                    ch = formatConsumptionValue(series[seriesIndex][dataPointIndex], 4);
                } else {
                    ch = '-';
                }
                return `<div class="heatmap-chart-widget-tooltip">
                        <h6 class="heatmap-chart-widget-tooltip-title">Energy Consumption</h6>
                        <div class="heatmap-chart-widget-tooltip-value">
                    
                        ${ch} kWh</div>
                        <div class="heatmap-chart-widget-tooltip-time-period">${moment(timestamp)
                            .tz(timeZone)
                            .format(`MMM D 'YY @ hh:mm A`)}</div>
                    </div>`;
            },
        },
        xaxis: {
            labels: {
                formatter: function (val) {
                    return moment(val).tz(timeZone).format('MM/DD HH:00');
                },
                hideOverlappingLabels: Boolean,
                rotate: 0,
                trim: false,
            },
            tickAmount: 12,
            axisTicks: {
                show: true,
            },
            style: {
                colors: ['#1D2939'],
                fontSize: '12px',
                fontFamily: 'Helvetica, Arial, sans-serif',
                fontWeight: 600,
                cssClass: 'apexcharts-xaxis-label',
            },
            crosshairs: {
                show: true,
                position: 'front',
                stroke: {
                    color: '#7C879C',
                    width: 2,
                    dashArray: 0,
                },
            },
        },
        yaxis: {
            labels: {
                formatter: function (val) {
                    let print = parseInt(val);
                    return `${print}`;
                },
            },
            style: {
                colors: ['#1D2939'],
                fontSize: '12px',
                fontFamily: 'Helvetica, Arial, sans-serif',
                fontWeight: 600,
                cssClass: 'apexcharts-xaxis-label',
            },
        },
    });

    useEffect(() => {
        let xaxisObj = xaxisFilters(startEndDayCount, timeZone);
        setConfigBarChartWidget({ ...configBarChartWidget, xaxis: xaxisObj });
    }, [startEndDayCount]);

    return (
        <div className={`heatmap-chart-widget-wrapper ${className}`}>
            <div className="ml-3 mt-3">
                <Typography.Subheader
                    size={Typography.Sizes.md}
                    as="h5"
                    fontWeight={Typography.Types.Medium}
                    className="mb-1">
                    {title}
                </Typography.Subheader>
                <Typography.Body size={Typography.Sizes.xs} as="h6">
                    {subtitle}
                </Typography.Body>
            </div>
            <div>
                {isAvgConsumptionDataLoading ? (
                    <div className="loader-center-style" style={{ height: '400px' }}>
                        <Spinner className="m-2" color={'primary'} />
                    </div>
                ) : (
                    <div>
                        <HeatMapChart options={weekEndsOptions} series={weekEndsSeries} height={height} />
                        <HeatMapChart options={weekDaysOptions} series={weekDaysSeries} height={height} />
                    </div>
                )}
            </div>
        </div>
    );
};

HeatMapWidget.propTypes = {
    title: PropTypes.string.isRequired,
    subtitle: PropTypes.string.isRequired,
    height: PropTypes.string,
    width: PropTypes.string,
    startEndDayCount: PropTypes.number,
    series: PropTypes.arrayOf(
        PropTypes.shape({
            name: PropTypes.string.isRequired,
            data: PropTypes.arrayOf(
                PropTypes.shape({
                    x: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
                    y: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
                }).isRequired
            ),
        })
    ).isRequired,
};

export default HeatMapWidget;
