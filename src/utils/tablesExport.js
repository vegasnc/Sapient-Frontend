import { percentageHandler } from '../utils/helper';
import { formatConsumptionValue } from '../helpers/helpers';

export const getTableHeadersList = (record) => {
    let arr = [];
    record.forEach((element) => {
        arr.push(element?.name);
    });
    return arr.join(', ');
};

export const getEquipmentTableCSVExport = (tableData, columns, preparedEndUseData) => {
    let dataToExport = [];
    tableData.forEach((tableRow, index) => {
        let arr = [];
        for (let i = 0; i <= columns.length - 1; i++) {
            switch (columns[i].accessor) {
                case 'end_use_id':
                    const fieldName = tableRow['end_use_id'];
                    arr.push(preparedEndUseData[fieldName]);
                    break;
                case 'tags':
                    const tags = tableRow['tags'];
                    const convertedTags = tags.join(' ');
                    arr.push(convertedTags);
                    break;
                case 'sensor_number':
                    const sensors = tableRow['sensor_number'];
                    const totalSensor = tableRow['total_sensor'];
                    let preparedData = '';
                    sensors.forEach((el) => {
                        preparedData += `${el}/${totalSensor} `;
                    });

                    arr.push(preparedData);
                    break;
                default:
                    arr.push(tableRow[columns[i].accessor]);
                    break;
            }
        }
        dataToExport.push(arr);
    });
    let csv = `${getTableHeadersList(columns)}\n`;

    dataToExport.forEach(function (row) {
        csv += row.join(',');
        csv += '\n';
    });
    return csv;
};

export const getExploreByEquipmentTableCSVExport = (tableData, columns) => {
    let dataToExport = [];
    tableData.forEach((tableRow, index) => {
        let arr = [];
        for (let i = 0; i <= columns.length - 1; i++) {
            switch (columns[i].accessor) {
                case 'equipment_name':
                    const name = tableRow['equipment_name'];
                    const search = ',';
                    const replaceWith = ' ';
                    const result = name.split(search).join(replaceWith);

                    arr.push(result);
                    break;
                case 'consumption':
                    const consumption = tableRow['consumption'];
                    arr.push(`${consumption.now / 1000} kWh`);
                    break;
                case 'change':
                    const change = tableRow['consumption'];
                    arr.push(`${change.change} %`);
                    break;

                default:
                    arr.push(tableRow[columns[i].accessor]);
                    break;
            }
        }
        dataToExport.push(arr);
    });
    let csv = `${getTableHeadersList(columns)}\n`;

    dataToExport.forEach(function (row) {
        csv += row.join(',');
        csv += '\n';
    });
    return csv;
};

export const getExploreByBuildingTableCSVExport = (tableData, columns) => {
    let dataToExport = [];
    tableData.forEach((tableRow, index) => {
        let arr = [];
        for (let i = 0; i <= columns.length - 1; i++) {
            switch (columns[i].accessor) {
                case 'building_name':
                    const name = tableRow['building_name'];
                    const search = ',';
                    const replaceWith = ' ';
                    const result = name.split(search).join(replaceWith);

                    arr.push(result);
                    break;
                case 'consumption':
                    const consumption = tableRow['consumption'];
                    arr.push(`${consumption.now / 1000} kWh`);
                    break;
                case 'change':
                    const change = tableRow['consumption'];
                    arr.push(`${change.change} %`);
                    break;
                case 'square_footage':
                    const square_footage = tableRow['square_footage'];
                    arr.push(`${square_footage} Sq.Ft.`);
                    break;

                default:
                    arr.push(tableRow[columns[i].accessor]);
                    break;
            }
        }
        dataToExport.push(arr);
    });
    let csv = `${getTableHeadersList(columns)}\n`;

    dataToExport.forEach(function (row) {
        csv += row.join(',');
        csv += '\n';
    });
    return csv;
};

export const getBuildingsTableCSVExport = (tableData, columns) => {
    let dataToExport = [];

    tableData.forEach((tableRow, index) => {
        let arr = [];

        for (let i = 0; i <= columns.length - 1; i++) {
            switch (columns[i].accessor) {
                case 'building_name':
                    const name = tableRow['building_name'];
                    const search = ',';
                    const replaceWith = ' ';
                    const result = name.split(search).join(replaceWith);
                    arr.push(result);
                    break;

                case 'building_size':
                    const size = tableRow['building_size'];
                    arr.push(`${size} Sq.Ft.`);
                    break;

                default:
                    arr.push(tableRow[columns[i].accessor]);
                    break;
            }
        }
        dataToExport.push(arr);
    });

    let csv = `${getTableHeadersList(columns)}\n`;

    dataToExport.forEach(function (row) {
        csv += row.join(',');
        csv += '\n';
    });
    return csv;
};

export const getCompareBuildingTableCSVExport = (tableData, columns, topEnergyDensity) => {
    let dataToExport = [];

    tableData.forEach((tableRow, index) => {
        let arr = [];
        for (let i = 0; i <= columns.length - 1; i++) {
            switch (columns[i].accessor) {
                case 'total_consumption':
                    const preparedConsumption = parseInt(tableRow.total_consumption / 1000);
                    arr.push(`${preparedConsumption} kWh`);
                    break;
                case 'energy_consumption':
                    const diffPercentage = percentageHandler(
                        tableRow.energy_consumption.now,
                        tableRow.energy_consumption.old
                    );
                    {
                        tableRow.energy_consumption.now >= tableRow.energy_consumption.old
                            ? arr.push(`+${diffPercentage}%`)
                            : arr.push(`-${diffPercentage}%`);
                    }
                    break;
                case 'energy_density':
                    const preparedEnergyDestiny = `${tableRow.energy_density.toFixed(2)} kWh / sq. ft.`;
                    arr.push(preparedEnergyDestiny);
                    break;
                case 'square_footage':
                    const squareFootage = formatConsumptionValue(tableRow.square_footage);
                    arr.push(squareFootage);
                    break;
                default:
                    arr.push(tableRow[columns[i].accessor]);
                    break;
            }
        }
        dataToExport.push(arr);
    });

    let csv = `${getTableHeadersList(columns)}\n`;

    dataToExport.forEach(function (row) {
        csv += row.join(',');
        csv += '\n';
    });
    return csv;
};

export const getEquipTypeTableCSVExport = (tableData, columns) => {
    let dataToExport = [];

    tableData.forEach((tableRow) => {
        let arr = [];

        for (let i = 0; i <= columns.length - 1; i++) {
            switch (columns[i].accessor) {
                default:
                    arr.push(tableRow[columns[i].accessor]);
                    break;
            }
        }
        dataToExport.push(arr);
    });

    let csv = `${getTableHeadersList(columns)}\n`;

    dataToExport.forEach(function (row) {
        csv += row.join(',');
        csv += '\n';
    });
    return csv;
};

export const getPassiveDeviceTableCSVExport = (tableData, columns) => {
    let dataToExport = [];

    columns.forEach((element) => {
        if (element.accessor === 'sensor_number') element.name = 'Sensors [In Use]';
    });

    tableData.forEach((tableRow) => {
        let arr = [];

        for (let i = 0; i <= columns.length - 1; i++) {
            switch (columns[i].accessor) {
                case 'sensor_number':
                    const name = tableRow['sensor_number'];
                    const search = '/';
                    const replaceWith = ' out of ';
                    const result = name.split(search).join(replaceWith);
                    arr.push(result);
                    break;

                case 'status':
                    const status = tableRow['status'];
                    const data = status ? 'Online' : 'Offline';
                    arr.push(data);
                    break;

                case 'model':
                    const model = tableRow['model'];
                    const modelName = model.charAt(0).toUpperCase() + model.slice(1);
                    arr.push(modelName);
                    break;

                case 'location':
                    const locationData = tableRow['location'];
                    const locationName = locationData === '' ? '-' : locationData;
                    arr.push(locationName);
                    break;

                default:
                    arr.push(tableRow[columns[i].accessor]);
                    break;
            }
        }
        dataToExport.push(arr);
    });

    let csv = `${getTableHeadersList(columns)}\n`;

    dataToExport.forEach(function (row) {
        csv += row.join(',');
        csv += '\n';
    });
    return csv;
};

export const getActiveDeviceTableCSVExport = (tableData, columns) => {
    let dataToExport = [];

    columns.forEach((element) => {
        if (element.accessor === 'sensor_count') element.name = 'Sensors [In Use]';
    });

    tableData.forEach((tableRow) => {
        let arr = [];

        for (let i = 0; i <= columns.length - 1; i++) {
            switch (columns[i].accessor) {
                case 'sensor_count':
                    const name = tableRow['sensor_number'];
                    const search = '/';
                    const replaceWith = ' out of ';
                    const result = name.split(search).join(replaceWith);
                    arr.push(result);
                    break;

                case 'stat':
                    const status = tableRow['stat'];
                    const data = status ? 'Online' : 'Offline';
                    arr.push(data);
                    break;

                case 'model':
                    const model = tableRow['model'];
                    const modelName = model.charAt(0).toUpperCase() + model.slice(1);
                    arr.push(modelName);
                    break;

                case 'location':
                    const locationData = tableRow['location'];
                    const locationName = locationData === '' ? '-' : locationData;
                    arr.push(locationName);
                    break;

                case 'hardware_version':
                    const hardwareData = tableRow['hardware_version'];
                    const hardwareName = hardwareData === '' ? '-' : String(hardwareData);
                    arr.push(hardwareName);
                    break;

                default:
                    arr.push(tableRow[columns[i].accessor]);
                    break;
            }
        }
        dataToExport.push(arr);
    });

    let csv = `${getTableHeadersList(columns)}\n`;

    dataToExport.forEach(function (row) {
        csv += row.join(',');
        csv += '\n';
    });
    return csv;
};

export const getPanelsTableCSVExport = (tableData, columns) => {
    let dataToExport = [];

    columns.forEach((element) => {
        if (element.accessor === 'breakers_linked') element.name = 'Breakers Linked';
    });

    tableData.forEach((tableRow) => {
        let arr = [];

        for (let i = 0; i <= columns.length - 1; i++) {
            switch (columns[i].accessor) {
                case 'breakers_linked':
                    const linked_breakers = tableRow['breakers_linked'];
                    const total_breakers = tableRow['breakers'];
                    const results = `${linked_breakers} out of ${total_breakers}`;
                    arr.push(results);
                    break;

                case 'panel_type':
                    const panel = tableRow['panel_type'];
                    const panelType = panel.charAt(0).toUpperCase() + panel.slice(1);
                    arr.push(panelType);
                    break;

                case 'location':
                    const locationData = tableRow['location'];
                    const locationName = locationData === '' ? '-' : locationData;
                    arr.push(locationName);
                    break;

                case 'parent':
                    const parentPanel = tableRow['parent'];
                    const parentPanelName = parentPanel ? parentPanel : '-';
                    arr.push(parentPanelName);
                    break;

                default:
                    arr.push(tableRow[columns[i].accessor]);
                    break;
            }
        }
        dataToExport.push(arr);
    });

    let csv = `${getTableHeadersList(columns)}\n`;

    dataToExport.forEach(function (row) {
        csv += row.join(',');
        csv += '\n';
    });
    return csv;
};
