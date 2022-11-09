import React, { useRef } from 'react';
import './LineChart.scss';
import { colorPalette } from './utils';
import Highcharts from 'highcharts/highstock';

import HighchartsReact from 'highcharts-react-official';
import Button from '../button/Button';
import Typography from '../typography';
import { ReactComponent as ArrowSVG } from '../../assets/icon/arrow.svg';
import { ReactComponent as BurgerIcon } from '../../assets/icon/burger.svg';
import DropDownIcon from '../dropDowns/dropDownButton/DropDownIcon';

require('highcharts/modules/exporting')(Highcharts);
require('highcharts/modules/export-data')(Highcharts);

const LineChart = (props) => {
    const chartComponentRef = useRef(null);

    const { data, title, subTitle, handleClick } = props;

    const preparedData = data.map((el, index) => {
        return {
            type: 'area',
            color: colorPalette[index],
            data: el,
            lineWidth: 2,
            showInLegend: true,
            panning: true,
            panKey: 'shift',
            fillColor: {
                linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                stops: [
                    [0, colorPalette[index]],
                    [1, 'rgba(255,255,255,.01)'],
                ],
            },
        };
    });

    const options = {
        chart: {
            type: 'line',
            zoomType: 'x',

            animation: {
                duration: 1000,
            },
        },
        navigator: {
            enabled: false,
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
            enabled: false,
        },
        plotOptions: {
            area: {
                fillColor: {
                    linearGradient: {
                        x1: 0,
                        y1: 0,
                        x2: 0,
                        y2: 1,
                    },
                    stops: [
                        [0, Highcharts.getOptions().colors[0]],
                        [1, Highcharts.color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')],
                    ],
                },
                marker: {
                    radius: 2,
                },
                lineWidth: 1,
                states: {
                    hover: {
                        lineWidth: 1,
                    },
                },
                threshold: null,
            },
        },
        credits: {
            enabled: false,
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
            zoomEnabled: true,
        },
        yAxis: [
            {
                gridLineWidth: 1,
                lineWidth: 1,
                opposite: false,
                accessibility: {
                    enabled: true,
                },
            },
        ],
        time: {
            useUTC: false,
        },
        series: [...preparedData],
        exporting: {
            enabled: true,
        },
    };

    const handleDropDownOptionClicked = (name) => {
        switch (name) {
            case 'downloadSVG':
                downloadSVG();
                break;
            case 'downloadPNG':
                downloadPNG();
                break;
            case 'downloadCSV':
                downloadCSV();
                break;
            default:
                break;
        }
    };

    const downloadCSV = () => {
        chartComponentRef.current.chart.downloadCSV();
    };

    const downloadPNG = () => {
        chartComponentRef.current.chart.exportChart({ type: 'image/png' });
    };

    const downloadSVG = () => {
        chartComponentRef.current.chart.exportChart({ type: 'image/svg+xml' });
    };

    return (
        <div className="line-chart-wrapper">
            <div className="chart-header">
                <div>
                    <Typography size={Typography.Sizes.sm} fontWeight={Typography.Types.SemiBold}>
                        {title}
                    </Typography>
                    <Typography.Body size={Typography.Sizes.xs}>{subTitle}</Typography.Body>
                </div>
                <div>
                    <DropDownIcon
                        options={[
                            {
                                name: 'downloadSVG',
                                label: 'Download SVG',
                            },
                            {
                                name: 'downloadPNG',
                                label: 'Download PNG',
                            },
                            {
                                name: 'downloadCSV',
                                label: 'DOWNLOAD CSV',
                            },
                        ]}
                        label={null}
                        triggerButtonIcon={<BurgerIcon />}
                        handleClick={(name) => {
                            handleDropDownOptionClicked(name);
                        }}
                    />
                </div>
            </div>
            <HighchartsReact
                highcharts={Highcharts}
                constructorType={'stockChart'}
                options={options}
                ref={chartComponentRef}
            />
            <div className="more-details-wrapper">
                <Button
                    onClick={handleClick}
                    className="ml-4"
                    label="More Details"
                    size={Button.Sizes.md}
                    type={Button.Type.tertiary}
                    icon={<ArrowSVG />}
                    iconAlignment="right"
                />
            </div>
        </div>
    );
};

export default LineChart;
