import React, { useState, useEffect } from 'react';
import Typography from '../typography';
import PropTypes from 'prop-types';
import { Spinner } from 'reactstrap';
import { configBarChartOpts } from './config';
import 'moment-timezone';
import { timeZone } from '../../utils/helper';
import { xaxisFilters } from '../../helpers/helpers';
import BarChart from '../../../src/pages/charts/BarChart';
import './style.scss';

const BarChartWidget = ({
    className = '',
    series,
    title,
    subtitle,
    height = 259,
    width,
    isConsumpHistoryLoading,
    startEndDayCount,
}) => {
    const [configBarChartWidget, setConfigBarChartWidget] = useState(configBarChartOpts);

    useEffect(() => {
        let xaxisObj = xaxisFilters(startEndDayCount, timeZone);
        setConfigBarChartWidget({ ...configBarChartWidget, xaxis: xaxisObj });
    }, [startEndDayCount]);

    return (
        <div className={`bar-chart-widget-wrapper ${className}`}>
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
                {isConsumpHistoryLoading ? (
                    <div className="loader-center-style">
                        <Spinner className="m-2" color={'primary'} />
                    </div>
                ) : (
                    <div>
                        <BarChart series={series} options={configBarChartWidget} />
                    </div>
                )}
            </div>
        </div>
    );
};

BarChartWidget.propTypes = {
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

export default BarChartWidget;
