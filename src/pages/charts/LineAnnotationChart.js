// @flow
import React from 'react';
import Chart from 'react-apexcharts';
import { Card, CardBody } from 'reactstrap';

// line chart with annotations
const LineAnnotationChart = ({ title, height, peakDemandTrendOptions, peakDemandTrendData }) => {
    const apexLineChartWithAnnotationOpts = {
        tooltip: {
            theme: 'dark',
            x: { show: false },
        },
        annotations: {
            yaxis: [
                {
                    y: 8200,
                    borderColor: '#0acf97',
                    label: {
                        borderColor: '#0acf97',
                        style: {
                            color: '#fff',
                            background: '#0acf97',
                        },
                        // text: 'Support',
                    },
                },
            ],
            xaxis: [
                {
                    x: new Date('23 Nov 2017').getTime(),
                    borderColor: '#775DD0',
                    label: {
                        borderColor: '#775DD0',
                        style: {
                            color: '#fff',
                            background: '#775DD0',
                        },
                        // text: 'Anno Test',
                    },
                },
                {
                    x: new Date('03 Dec 2017').getTime(),
                    borderColor: '#ffbc00',
                    label: {
                        borderColor: '#ffbc00',
                        style: {
                            color: '#fff',
                            background: '#ffbc00',
                        },
                        orientation: 'horizontal',
                        // text: 'New Beginning',
                    },
                },
            ],
            // points: [
            //     {
            //         x: new Date('27 Nov 2017').getTime(),
            //         y: 8506.9,
            //         marker: {
            //             size: 8,
            //             fillColor: '#fff',
            //             strokeColor: '#fa5c7c',
            //             radius: 2,
            //         },
            //         label: {
            //             borderColor: '#fa5c7c',
            //             offsetY: 0,
            //             style: {
            //                 color: '#fff',
            //                 background: '#fa5c7c',
            //             },

            //             // text: 'Point Annotation',
            //         },
            //     },
            // ],
        },
        chart: {
            type: 'line',
            // id: 'areachart-2',
        },
        labels: [
            '13 Nov 2017',
            '14 Nov 2017',
            '15 Nov 2017',
            '16 Nov 2017',
            '17 Nov 2017',
            '20 Nov 2017',
            '21 Nov 2017',
            '22 Nov 2017',
            '23 Nov 2017',
            '24 Nov 2017',
            '27 Nov 2017',
            '28 Nov 2017',
            '29 Nov 2017',
            '30 Nov 2017',
            '01 Dec 2017',
            '04 Dec 2017',
            '05 Dec 2017',
            '06 Dec 2017',
            '07 Dec 2017',
            '08 Dec 2017',
        ],
        colors: ['#39afd1'],
        dataLabels: {
            enabled: false,
        },
        stroke: {
            width: [3, 3],
            curve: 'smooth',
        },
        xaxis: {
            // type: 'datetime',
            labels: {
                labels: {
                    format: 'dddd',
                },
            },
            // categories: ['Week 1', 'Week 3', 'Week 5'],
        },
        yaxis: {
            labels: {
                formatter: function (val) {
                    return val + 'K';
                },
            },
        },
        grid: {
            row: {
                colors: ['transparent', 'transparent'], // takes an array which will be repeated on columns
                opacity: 0.2,
            },
            borderColor: '#e9ecef',
        },
        responsive: [
            {
                breakpoint: 600,
                options: {
                    chart: {
                        toolbar: {
                            show: false,
                        },
                    },
                    legend: {
                        show: false,
                    },
                },
            },
        ],
    };

    const apexLineChartWithAnnotationData = [
        {
            name: 'Prices',
            data: [
                8107.85, 8128, 8122.9, 8165.5, 8340.7, 8423.7, 8423.5, 8514.3, 8481.85, 8487.7, 8506.9, 8626.2, 8668.95,
                8602.3, 8607.55, 8512.9, 8496.25, 8600.65, 8881.1, 9340.85,
            ],
        },
    ];

    return (
        <Card>
            <CardBody>
                <h4 className="header-title mt-0 mb-3">{title}</h4>
                <Chart
                    options={peakDemandTrendOptions}
                    series={peakDemandTrendData}
                    height={height}
                    type="line"
                    className="apex-charts"
                />
            </CardBody>
        </Card>
    );
};

export default LineAnnotationChart;
