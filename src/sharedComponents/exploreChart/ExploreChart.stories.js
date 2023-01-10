import React, { useState } from 'react';
import ExploreChart from './ExploreChart';
import { mockedData, mockedData2, mockedData3 } from './mock';

export default {
    title: 'Charts/ExploreChart',
    component: ExploreChart,
};
const dateRange = {
    minDate: new Date('2022-09-1').getTime(),
    maxDate: new Date('2022-11-1').getTime(),
};

const data = [
    { name: 'mockedData1', data: mockedData },
    { name: 'mockedData2', data: mockedData2 },
    { name: 'mockedData3', data: mockedData3 },
];

export const Default = (args) => {
    const [isLoadingData, setIsLoadingData] = useState(true);
    setTimeout(() => {
        setIsLoadingData(false);
    }, 5000);
    return <ExploreChart {...args} isLoadingData={isLoadingData} />;
};

Default.args = {
    title: 'Chart title',
    subTitle: 'Chart subtitle',
    isLoadingData: true,
    data,
    dateRange,
};