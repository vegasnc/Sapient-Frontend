export const openAlertsMockData = [
    {
        target: '123 Main St. portland, OR',
        target_type: 'Building',
        condition: 'Energy consumption for the month is above 10,000 kWh',
        timestamps: '2023-10-17T07:00:08.657Z',
    },
    {
        target: 'Cooling - Multiple equipment',
        target_type: 'Equipment',
        condition: 'RMS Current is above 123 A',
        timestamps: '2023-10-17T08:00:08.657Z',
    },
    {
        target: 'Building of any type',
        target_type: 'Building',
        condition: 'Peak Demand for current month is above 1,300 kWh',
        timestamps: '2023-10-17T09:00:08.657Z',
    },
    {
        target: 'Cooling AHU 1',
        target_type: 'Equipment',
        condition: 'Energy consumption for the month is above 10,000 kWh',
        timestamps: '2023-10-17T10:25:08.657Z',
    },
];

export const alertSettingsMock = [
    {
        target: 'Building of any type',
        target_type: 'Building',
        condition: 'Energy consumption for the month is above 400 kWh',
        sent_to: 'test.user@sapient.industries',
        created_at: '2023/10/04',
    },
    {
        target: 'Cooling - Multiple equipment',
        target_type: 'Equipment',
        sent_to: 'test.user@sapient.industries',
        condition: 'RMS Current is above 123 A',
        created_at: '2023/10/05',
    },
    {
        target: 'Equipment of any type',
        target_type: 'Equipment',
        condition: 'Peak Power is above 123 kW',
        sent_to: 'test.user@sapient.industries',
        created_at: '2023/10/06',
    },
    {
        target: '15 University Blvd. Hartford, CT',
        target_type: 'Building',
        sent_to: 'test.user@sapient.industries',
        condition: 'Peak Demand for current month is above 1300 kWh',
        created_at: '2023/10/07',
    },
    {
        target: '123 Main St. Portland, OR',
        target_type: 'Building',
        sent_to: 'test.user@sapient.industries',
        condition: 'Energy consumption for the month is above 400 kWh',
        created_at: '2023/10/08',
    },
    {
        target: 'Cooling AHU 1',
        target_type: 'Equipment',
        sent_to: 'test.user@sapient.industries',
        condition: 'Peak Power is above 123 kWh',
        created_at: '2023/10/09',
    },
];
