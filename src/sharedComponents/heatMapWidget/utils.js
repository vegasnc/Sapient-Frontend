import moment from 'moment';

export const heatMapChartHeight = 125;

export const HeatMapChartOpts = {
    chart: {
        type: 'heatmap',
        toolbar: {
            show: true,
        },
    },
    dataLabels: {
        enabled: false,
    },
    stroke: {
        width: 1,
    },
    legend: {
        show: false,
    },
    plotOptions: {
        heatmap: {
            shadeIntensity: 0.5,
            enableShades: true,
            distributed: true,
            radius: 1,
            useFillColorAsStroke: false,
            colorScale: {
                ranges: [
                    {
                        from: 0,
                        to: 3,
                        color: '#F5F8FF',
                    },
                    {
                        from: 4,
                        to: 8,
                        color: '#EDF3FF',
                    },
                    {
                        from: 9,
                        to: 12,
                        color: '#E5EDFF',
                    },
                    {
                        from: 13,
                        to: 16,
                        color: '#DDE8FE',
                    },
                    {
                        from: 17,
                        to: 21,
                        color: '#D6E2FE',
                    },
                    {
                        from: 22,
                        to: 25,
                        color: '#CEDDFE',
                    },
                    {
                        from: 26,
                        to: 29,
                        color: '#C6D7FE',
                    },
                    {
                        from: 30,
                        to: 33,
                        color: '#BED1FE',
                    },
                    {
                        from: 34,
                        to: 38,
                        color: '#B6CCFE',
                    },
                    {
                        from: 39,
                        to: 42,
                        color: '#AEC6FE',
                    },
                    {
                        from: 43,
                        to: 46,
                        color: '#A6C0FD',
                    },
                    {
                        from: 47,
                        to: 51,
                        color: '#9EBBFD',
                    },
                    {
                        from: 52,
                        to: 55,
                        color: '#96B5FD',
                    },
                    {
                        from: 56,
                        to: 59,
                        color: '#8EB0FD',
                    },
                    {
                        from: 60,
                        to: 64,
                        color: '#86AAFD',
                    },
                    {
                        from: 65,
                        to: 68,
                        color: '#7FA4FD',
                    },
                    {
                        from: 69,
                        to: 72,
                        color: '#F8819D',
                    },
                    {
                        from: 73,
                        to: 76,
                        color: '#F87795',
                    },
                    {
                        from: 77,
                        to: 81,
                        color: '#F86D8E',
                    },
                    {
                        from: 82,
                        to: 85,
                        color: '#F76486',
                    },
                    {
                        from: 86,
                        to: 89,
                        color: '#F75A7F',
                    },
                    {
                        from: 90,
                        to: 94,
                        color: '#F75077',
                    },
                    {
                        from: 95,
                        to: 98,
                        color: '#F64770',
                    },
                    {
                        from: 98,
                        to: 100,
                        color: '#F63D68',
                    },
                ],
            },
        },
    },
    yaxis: {
        labels: {
            show: true,
            minWidth: 40,
            maxWidth: 160,
        },
        categories: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    },
    xaxis: {
        labels: {
            show: true,
            align: 'top',
        },
        categories: [
            '12AM',
            '1AM',
            '2AM',
            '3AM',
            '4AM',
            '5AM',
            '6AM',
            '7AM',
            '8AM',
            '9AM',
            '10AM',
            '11AM',
            '12PM',
            '1PM',
            '2PM',
            '3PM',
            '4PM',
            '5PM',
            '6PM',
            '7PM',
            '8PM',
            '9PM',
            '10PM',
            '11PM',
        ],
        position: 'bottom',
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
        x: {
            show: true,
            type: 'datetime',
            labels: {
                formatter: function (val, timestamp) {
                    return moment(timestamp).format('DD/MM - HH:mm');
                },
            },
        },
        y: {
            formatter: function (value, { series, seriesIndex, dataPointIndex, w }) {
                return value + ' K';
            },
        },
        marker: {
            show: false,
        },
        custom: function ({ series, seriesIndex, dataPointIndex, w }) {
            const { seriesNames } = w.globals;
            const day = seriesNames[seriesIndex];
            const energyVal = w.config.series[seriesIndex].data[dataPointIndex].z;

            return `<div class="line-chart-widget-tooltip">
                        <h6 class="line-chart-widget-tooltip-title">Energy Usage by Hour</h6>
                        <div class="line-chart-widget-tooltip-value">${energyVal} kWh</div>
                        <div class="line-chart-widget-tooltip-time-period">
                        ${day}, ${w.globals.labels[dataPointIndex]}
                        </div>
                    </div>`;
        },
    },
};

export const HeatMapSeriesData = [
    {
        name: 'Series B',
        data: [
            {
                x: '12AM',
                y: 3,
                z: 98,
            },
            {
                x: '1AM',
                y: 8,
                z: 108,
            },
            {
                x: '2AM',
                y: 15,
                z: 124,
            },
            {
                x: '3AM',
                y: 30,
                z: 154,
            },
            {
                x: '4AM',
                y: 32,
                z: 160,
            },
            {
                x: '5AM',
                y: 30,
                z: 155,
            },
            {
                x: '6AM',
                y: 27,
                z: 149,
            },
            {
                x: '7AM',
                y: 31,
                z: 156,
            },
            {
                x: '8AM',
                y: 24,
                z: 142,
            },
            {
                x: '9AM',
                y: 26,
                z: 147,
            },
            {
                x: '10AM',
                y: 26,
                z: 147,
            },
            {
                x: '11AM',
                y: 25,
                z: 145,
            },
            {
                x: '12PM',
                y: 19,
                z: 131,
            },
            {
                x: '1PM',
                y: 20,
                z: 134,
            },
            {
                x: '2PM',
                y: 21,
                z: 135,
            },
            {
                x: '3PM',
                y: 21,
                z: 135,
            },
            {
                x: '4PM',
                y: 19,
                z: 132,
            },
            {
                x: '5PM',
                y: 15,
                z: 124,
            },
            {
                x: '6PM',
                y: 24,
                z: 143,
            },
            {
                x: '7PM',
                y: 14,
                z: 121,
            },
            {
                x: '8PM',
                y: 23,
                z: 141,
            },
            {
                x: '9PM',
                y: 19,
                z: 132,
            },
            {
                x: '10PM',
                y: 30,
                z: 154,
            },
            {
                x: '11PM',
                y: 0,
                z: 91,
            },
        ],
    },
    {
        name: 'Series A',
        data: [
            {
                x: '12AM',
                y: 63,
                z: 226,
            },
            {
                x: '1AM',
                y: 76,
                z: 252,
            },
            {
                x: '2AM',
                y: 83,
                z: 267,
            },
            {
                x: '3AM',
                y: 95,
                z: 294,
            },
            {
                x: '4AM',
                y: 100,
                z: 304,
            },
            {
                x: '5AM',
                y: 79,
                z: 259,
            },
            {
                x: '6AM',
                y: 63,
                z: 225,
            },
            {
                x: '7AM',
                y: 73,
                z: 246,
            },
            {
                x: '8AM',
                y: 61,
                z: 221,
            },
            {
                x: '9AM',
                y: 64,
                z: 227,
            },
            {
                x: '10AM',
                y: 72,
                z: 244,
            },
            {
                x: '11AM',
                y: 70,
                z: 241,
            },
            {
                x: '12PM',
                y: 62,
                z: 223,
            },
            {
                x: '1PM',
                y: 65,
                z: 229,
            },
            {
                x: '2PM',
                y: 54,
                z: 206,
            },
            {
                x: '3PM',
                y: 50,
                z: 198,
            },
            {
                x: '4PM',
                y: 57,
                z: 212,
            },
            {
                x: '5PM',
                y: 51,
                z: 200,
            },
            {
                x: '6PM',
                y: 59,
                z: 216,
            },
            {
                x: '7PM',
                y: 53,
                z: 203,
            },
            {
                x: '8PM',
                y: 55,
                z: 209,
            },
            {
                x: '9PM',
                y: 52,
                z: 202,
            },
            {
                x: '10PM',
                y: 79,
                z: 260,
            },
            {
                x: '11PM',
                y: 61,
                z: 221,
            },
        ],
    },
];
