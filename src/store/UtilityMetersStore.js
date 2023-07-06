import { Store } from 'pullstate';

export const UtilityMetersStore = new Store({
    utilityMetersList: [
        {
            id: '1',
            status: true,
            device_id: '00:B0:D0:63:C2:26',
            modbus: '1',
            model: 'sapient-pulse',
            model_name: 'Sapient Pulse (CLSM-1001)',
        },
        {
            id: '2',
            status: false,
            device_id: '39:D0:B0:36:A2:67',
            modbus: '2',
            model: 'sapient-pulse',
            model_name: 'Sapient Pulse (CLSM-1001)',
        },
    ],
});
