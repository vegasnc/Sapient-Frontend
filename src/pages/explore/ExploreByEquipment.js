import React, { useState, useEffect } from 'react';
//import DatePicker from 'react-datepicker';
import { Row, Col, Input, Card, CardBody, Table } from 'reactstrap';
import axios from 'axios';
import BrushChart from '../charts/BrushChart';
import { percentageHandler, dateFormatHandler } from '../../utils/helper';
import { BaseUrl, getExploreEquipmentList, getExploreEquipmentChart, getFloors, equipmentType, getEndUseId, getSpaceTypes} from '../../services/Network';
import { BreadcrumbStore } from '../../store/BreadcrumbStore';
import { DateRangeStore } from '../../store/DateRangeStore';
import { BuildingStore } from '../../store/BuildingStore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass, faTableColumns, faDownload } from '@fortawesome/pro-regular-svg-icons';
import { Cookies } from 'react-cookie';
import { ComponentStore } from '../../store/ComponentStore';
import { MultiSelect } from 'react-multi-select-component';
import { Spinner } from 'reactstrap';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { Line } from 'rc-progress';
import { useParams } from 'react-router-dom';
import EquipChartModal from './EquipChartModal';
import Dropdown from 'react-bootstrap/Dropdown';
//import ApexCharts from 'apexcharts';
import './style.css';
//import { forEach, remove } from 'lodash';
import RangeSlider from './RangeSlider';
//import { FilterList, FilterListSharp } from '@mui/icons-material';
import moment from 'moment';
import { CSVLink } from 'react-csv';
import Header from '../../components/Header';
import { set } from 'lodash';

const ExploreEquipmentTable = ({
    exploreTableData,
    isExploreDataLoading,
    topEnergyConsumption,
    topPeakConsumption,
    handleChartOpen,
    setEquipmentFilter,
    selectedEquipmentId,
    setSelectedEquipmentId,
    removeEquipmentId,
    setRemovedEquipmentId,
    equipmentListArray,
    setEquipmentListArray,
    nextPageData,
    previousPageData,
    paginationData,
    pageSize,
    setPageSize,
}) => {
    const handleSelectionAll = (e) => {
        var ischecked = document.getElementById('selection');
        if (ischecked.checked == true) {
            let arr = [];
            for (var i = 0; i < exploreTableData.length; i++) {
                arr.push(exploreTableData[i].equipment_id);
                // console.log(arr);

                var checking = document.getElementById(exploreTableData[i].equipment_id);
                checking.checked = ischecked.checked;
            }
            setEquipmentListArray(arr);
        } else {
            for (var i = 0; i < exploreTableData.length; i++) {
                var checking = document.getElementById(exploreTableData[i].equipment_id);
                checking.checked = ischecked.checked;
            }
            ischecked.checked = ischecked.checked;
        }
    };

    const handleSelection = (e, id) => {
        var isChecked = document.getElementById(id);
        if (isChecked.checked == true) {
            setSelectedEquipmentId(id);
        } else {
            setRemovedEquipmentId(id);
        }
    };

    return (
        <>
            <Card>
                <CardBody>
                    <Col md={8}>
                        <Table className="mb-0 bordered mouse-pointer">
                            <thead>
                                <tr>
                                    <th className="table-heading-style">
                                        <input
                                            type="checkbox"
                                            className="mr-4"
                                            id="selection"
                                            onClick={(e) => {
                                                handleSelectionAll(e);
                                            }}
                                        />
                                        Name
                                    </th>
                                    <th className="table-heading-style">Energy Consumption</th>
                                    <th className="table-heading-style">% Change</th>
                                    <th className="table-heading-style">Location</th>
                                    <th className="table-heading-style">Location Type</th>
                                    <th className="table-heading-style">Equipment Type</th>
                                    <th className="table-heading-style">End Use Category</th>
                                </tr>
                            </thead>

                            {isExploreDataLoading ? (
                                <tbody>
                                    <SkeletonTheme color="#202020" height={35}>
                                        <tr>
                                            <td>
                                                <Skeleton count={5} />
                                            </td>

                                            <td>
                                                <Skeleton count={5} />
                                            </td>

                                            <td>
                                                <Skeleton count={5} />
                                            </td>

                                            <td>
                                                <Skeleton count={5} />
                                            </td>

                                            <td>
                                                <Skeleton count={5} />
                                            </td>
                                            <td>
                                                <Skeleton count={5} />
                                            </td>

                                            <td>
                                                <Skeleton count={5} />
                                            </td>
                                        </tr>
                                    </SkeletonTheme>
                                </tbody>
                            ) : (
                                <tbody>
                                    {!(exploreTableData?.length === 0) &&
                                        exploreTableData?.map((record, index) => {
                                            if (record?.eq_name === null) {
                                                return;
                                            }
                                            return (
                                                <tr key={index}>
                                                    <th scope="row">
                                                        <input
                                                            type="checkbox"
                                                            className="mr-4"
                                                            id={record?.equipment_id}
                                                            value={record?.equipment_id}
                                                            onClick={(e) => {
                                                                handleSelection(e, record?.equipment_id);
                                                            }}
                                                        />
                                                        <a
                                                            className="building-name"
                                                            onClick={() => {
                                                                setEquipmentFilter({
                                                                    equipment_id: record?.equipment_id,
                                                                    equipment_name: record?.equipment_name,
                                                                });
                                                                localStorage.setItem(
                                                                    'exploreEquipName',
                                                                    record?.equipment_name
                                                                );
                                                                handleChartOpen();
                                                            }}>
                                                            {record?.equipment_name === ''
                                                                ? '-'
                                                                : record?.equipment_name}
                                                        </a>
                                                    </th>

                                                    <td className="table-content-style font-weight-bold">
                                                        {(record?.consumption?.now / 1000).toFixed(2)} kWh
                                                        <br />
                                                        <div style={{ width: '100%', display: 'inline-block' }}>
                                                            {index === 0 && record?.consumption?.now === 0 && (
                                                                <Line
                                                                    percent={0}
                                                                    strokeWidth="3"
                                                                    trailWidth="3"
                                                                    strokeColor={`#D14065`}
                                                                    strokeLinecap="round"
                                                                />
                                                            )}
                                                            {index === 0 && record?.consumption?.now > 0 && (
                                                                <Line
                                                                    percent={parseFloat(
                                                                        (record?.consumption?.now /
                                                                            topEnergyConsumption) *
                                                                            100
                                                                    ).toFixed(2)}
                                                                    strokeWidth="3"
                                                                    trailWidth="3"
                                                                    strokeColor={`#D14065`}
                                                                    strokeLinecap="round"
                                                                />
                                                            )}
                                                            {index === 1 && (
                                                                <Line
                                                                    percent={parseFloat(
                                                                        (record?.consumption?.now /
                                                                            topEnergyConsumption) *
                                                                            100
                                                                    ).toFixed(2)}
                                                                    strokeWidth="3"
                                                                    trailWidth="3"
                                                                    strokeColor={`#DF5775`}
                                                                    strokeLinecap="round"
                                                                />
                                                            )}
                                                            {index === 2 && (
                                                                <Line
                                                                    percent={parseFloat(
                                                                        (record?.consumption?.now /
                                                                            topEnergyConsumption) *
                                                                            100
                                                                    ).toFixed(2)}
                                                                    strokeWidth="3"
                                                                    trailWidth="3"
                                                                    strokeColor={`#EB6E87`}
                                                                    strokeLinecap="round"
                                                                />
                                                            )}
                                                            {index === 3 && (
                                                                <Line
                                                                    percent={parseFloat(
                                                                        (record?.consumption?.now /
                                                                            topEnergyConsumption) *
                                                                            100
                                                                    ).toFixed(2)}
                                                                    strokeWidth="3"
                                                                    trailWidth="3"
                                                                    strokeColor={`#EB6E87`}
                                                                    strokeLinecap="round"
                                                                />
                                                            )}
                                                            {index === 4 && (
                                                                <Line
                                                                    percent={parseFloat(
                                                                        (record?.consumption?.now /
                                                                            topEnergyConsumption) *
                                                                            100
                                                                    ).toFixed(2)}
                                                                    strokeWidth="3"
                                                                    trailWidth="3"
                                                                    strokeColor={`#FC9EAC`}
                                                                    strokeLinecap="round"
                                                                />
                                                            )}
                                                            {index === 5 && (
                                                                <Line
                                                                    percent={parseFloat(
                                                                        (record?.consumption?.now /
                                                                            topEnergyConsumption) *
                                                                            100
                                                                    ).toFixed(2)}
                                                                    strokeWidth="3"
                                                                    trailWidth="3"
                                                                    strokeColor={`#FFCFD6`}
                                                                    strokeLinecap="round"
                                                                />
                                                            )}
                                                        </div>
                                                    </td>

                                                    <td>
                                                        {record?.consumption?.now <= record?.consumption?.old && (
                                                            <button
                                                                className="button-success text-success btn-font-style"
                                                                style={{ width: 'auto' }}>
                                                                <i className="uil uil-chart-down">
                                                                    <strong>
                                                                        {percentageHandler(
                                                                            record?.consumption?.now,
                                                                            record?.consumption?.old
                                                                        )}
                                                                        %
                                                                    </strong>
                                                                </i>
                                                            </button>
                                                        )}
                                                        {record?.consumption?.now > record?.consumption?.old && (
                                                            <button
                                                                className="button-danger text-danger btn-font-style"
                                                                style={{ width: 'auto', marginBottom: '4px' }}>
                                                                <i className="uil uil-arrow-growth">
                                                                    <strong>
                                                                        {percentageHandler(
                                                                            record?.consumption?.now,
                                                                            record?.consumption?.old
                                                                        )}
                                                                        %
                                                                    </strong>
                                                                </i>
                                                            </button>
                                                        )}
                                                    </td>
                                                    <td className="table-content-style font-weight-bold">
                                                        {record?.location === '' ? '-' : record?.location}
                                                    </td>
                                                    <td className="table-content-style font-weight-bold">
                                                        {record?.location_type === '' ? '-' : record?.location_type}
                                                    </td>
                                                    <td className="table-content-style font-weight-bold">
                                                        {record?.equipments_type}
                                                    </td>
                                                    <td className="table-content-style font-weight-bold">
                                                        {record?.end_user}
                                                    </td>

                                                    {/* <td className="table-content-style font-weight-bold">
                                                        {(record?.peak_power?.now / 100000).toFixed(3)} kW
                                                        <br />
                                                        <div style={{ width: '100%', display: 'inline-block' }}>
                                                            {index === 0 && record?.peak_power?.now === 0 && (
                                                                <Line
                                                                    percent={0}
                                                                    strokeWidth="3"
                                                                    trailWidth="3"
                                                                    strokeColor={`#D14065`}
                                                                    strokeLinecap="round"
                                                                />
                                                            )}
                                                            {index === 0 && record?.peak_power?.now > 0 && (
                                                                <Line
                                                                    percent={parseFloat(
                                                                        (record?.peak_power?.now / topPeakConsumption) *
                                                                        100
                                                                    ).toFixed(2)}
                                                                    strokeWidth="3"
                                                                    trailWidth="3"
                                                                    strokeColor={`#D14065`}
                                                                    strokeLinecap="round"
                                                                />
                                                            )}
                                                            {index === 1 && (
                                                                <Line
                                                                    percent={parseFloat(
                                                                        (record?.peak_power?.now / topPeakConsumption) *
                                                                        100
                                                                    ).toFixed(2)}
                                                                    strokeWidth="3"
                                                                    trailWidth="3"
                                                                    strokeColor={`#DF5775`}
                                                                    strokeLinecap="round"
                                                                />
                                                            )}
                                                            {index === 2 && (
                                                                <Line
                                                                    percent={parseFloat(
                                                                        (record?.peak_power?.now / topPeakConsumption) *
                                                                        100
                                                                    ).toFixed(2)}
                                                                    strokeWidth="3"
                                                                    trailWidth="3"
                                                                    strokeColor={`#EB6E87`}
                                                                    strokeLinecap="round"
                                                                />
                                                            )}
                                                            {index === 3 && (
                                                                <Line
                                                                    percent={parseFloat(
                                                                        (record?.peak_power?.now / topPeakConsumption) *
                                                                        100
                                                                    ).toFixed(2)}
                                                                    strokeWidth="3"
                                                                    trailWidth="3"
                                                                    strokeColor={`#EB6E87`}
                                                                    strokeLinecap="round"
                                                                />
                                                            )}
                                                            {index === 4 && (
                                                                <Line
                                                                    percent={parseFloat(
                                                                        (record?.peak_power?.now / topPeakConsumption) *
                                                                        100
                                                                    ).toFixed(2)}
                                                                    strokeWidth="3"
                                                                    trailWidth="3"
                                                                    strokeColor={`#FC9EAC`}
                                                                    strokeLinecap="round"
                                                                />
                                                            )}
                                                            {index === 5 && (
                                                                <Line
                                                                    percent={parseFloat(
                                                                        (record?.peak_power?.now / topPeakConsumption) *
                                                                        100
                                                                    ).toFixed(2)}
                                                                    strokeWidth="3"
                                                                    trailWidth="3"
                                                                    strokeColor={`#FFCFD6`}
                                                                    strokeLinecap="round"
                                                                />
                                                            )}
                                                        </div>
                                                    </td>

                                                    <td>
                                                        {record?.peak_power?.now <= record?.peak_power?.old && (
                                                            <button
                                                                className="button-success text-success btn-font-style"
                                                                style={{ width: 'auto' }}>
                                                                <i className="uil uil-chart-down">
                                                                    <strong>
                                                                        {percentageHandler(
                                                                            record?.peak_power?.now,
                                                                            record?.peak_power?.old
                                                                        )}
                                                                        %
                                                                    </strong>
                                                                </i>
                                                            </button>
                                                        )}
                                                        {record?.peak_power?.now > record?.peak_power?.old && (
                                                            <button
                                                                className="button-danger text-danger btn-font-style"
                                                                style={{ width: 'auto', marginBottom: '4px' }}>
                                                                <i className="uil uil-arrow-growth">
                                                                    <strong>
                                                                        {percentageHandler(
                                                                            record?.peak_power?.now,
                                                                            record?.peak_power?.old
                                                                        )}
                                                                        %
                                                                    </strong>
                                                                </i>
                                                            </button>
                                                        )}
                                                    </td> */}
                                                </tr>
                                            );
                                        })}
                                </tbody>
                            )}
                        </Table>
                    <div className="page-button-style">
                        <button
                            type="button"
                            className="btn btn-md btn-light font-weight-bold mt-4"
                            disabled={
                                paginationData.pagination !== undefined
                                    ? paginationData.pagination.previous === null
                                        ? true
                                        : false
                                    : false
                            }
                            onClick={() => {
                                previousPageData(paginationData.pagination.previous);
                            }}>
                            Previous
                        </button>
                        <button
                            type="button"
                            className="btn btn-md btn-light font-weight-bold mt-4"
                            disabled={
                                true
                            }
                            onClick={() => {
                                nextPageData(paginationData.pagination.next);
                            }}>
                            Next
                        </button>
                        <div>
                            <select
                                value={pageSize}
                                className="btn btn-md btn-light font-weight-bold mt-4"
                                onChange={(e) => {
                                    setPageSize(parseInt(e.target.value));
                                }}>
                                {[20, 50, 100].map((pageSize) => (
                                    <option key={pageSize} value={pageSize} className="align-options-center">
                                        Show {pageSize} devices
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    </Col>
                </CardBody>
            </Card>
        </>
    );
};

const ExploreByEquipment = () => {
    const { bldgId } = useParams();
    const timeZone = localStorage.getItem('exploreBldTimeZone');

    let cookies = new Cookies();
    let userdata = cookies.get('user');

    const startDate = DateRangeStore.useState((s) => new Date(s.startDate));
    const endDate = DateRangeStore.useState((s) => new Date(s.endDate));
    const [isExploreChartDataLoading, setIsExploreChartDataLoading] = useState(false);

    const [isExploreDataLoading, setIsExploreDataLoading] = useState(false);

    const [seriesData, setSeriesData] = useState([]);
    const [selectedOptions, setSelectedOptions] = useState([]);

    const tableColumnOptions = [
        { label: 'Energy Consumption', value: 'consumption' },
        { label: 'Change', value: 'change' },
        { label: 'Location', value: 'location' },
        { label: 'Space Type', value: 'location_type' },
        { label: 'Equipment Type', value: 'equip_type' },
        { label: 'End Use Category', value: 'endUse_category' },
    ];
    const [equipOptions, setEquipOptions] = useState([]);
    const [endUseOptions, setEndUseOptions] = useState([]);
    const [paginationData, setPaginationData] = useState({});
    const [pageSize, setPageSize] = useState(20);
    const [pageNo, setPageNo] = useState(1);
    const [optionsData, setOptionsData] = useState({
        chart: {
            id: 'chart2',
            type: 'line',
            height: '1000px',
            toolbar: {
                autoSelected: 'pan',
                show: false,
            },
            animations: {
                enabled: false,
            },
            zoom: {
                type: 'x',
                enabled: true,
                autoScaleYaxis: true
              },
        },
        legend: {
            position: 'top',
            horizontalAlign: 'left',
            //showForSingleSeries: true,
            // showForNullSeries: false,
            // showForZeroSeries: false,
            fontSize: '18px',
            fontFamily: 'Helvetica, Arial',
            fontWeight: 600,
            itemMargin: {
                horizontal: 30,
                vertical: 20,
            },
        },
        colors: ['#546E7A'],
        stroke: {
            width: 3,
        },
        dataLabels: {
            enabled: false,
        },
        colors: ['#3C6DF5', '#12B76A', '#DC6803', '#088AB2', '#EF4444'],
        fill: {
            opacity: 1,
        },
        markers: {
            size: 0,
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
                    return value ;
                },
            },
            marker: {
                show: false,
            },
            custom: function ({ series, seriesIndex, dataPointIndex, w }) {
                const { seriesX } = w.globals;
                const timestamp = new Date(seriesX[seriesIndex][dataPointIndex]);

                return `<div class="line-chart-widget-tooltip">
                        <h6 class="line-chart-widget-tooltip-title">Energy Consumption</h6>
                        <div class="line-chart-widget-tooltip-value">${(
                            series[seriesIndex][dataPointIndex] / 1000
                        ).toFixed(3)} kWh</div>
                        <div class="line-chart-widget-tooltip-time-period">${moment(timestamp).format(
                            `MMM D 'YY @ HH:mm`
                        )}</div>
                    </div>`;
            },
        },
        xaxis: {
            type: 'datetime',
            labels: {
                formatter: function (val, timestamp) {
                    return moment(timestamp).format('DD/MM HH:00');
                    // return `${moment(timestamp).format('DD/MMM')} ${moment(timestamp).format('LT')}`;
                },
            },
            tickAmount: 24,
            tickPlacement: 'between',
        },
        yaxis: {
            labels: {
                formatter: function (value) {
                    return (value / 1000).toFixed(3);
                },
            },
        },
    });

    const [seriesLineData, setSeriesLineData] = useState([]);
    const [optionsLineData, setOptionsLineData] = useState({
        chart: {
            id: 'chart1',
            height: '500px',
            toolbar: {
                show: false,
            },

            animations: {
                enabled: false,
            },
            type: 'area',
            brush: {
                target: 'chart2',
                enabled: true,
            },
            selection: {
                enabled: true,
                // xaxis: {
                //     min: new Date('01 June 2022').getTime(),
                //     max: new Date('02 June 2022').getTime(),
                // },
            },
        },
        legend: {
            show: false,
        },
        colors: ['#3C6DF5', '#12B76A', '#DC6803', '#088AB2', '#EF4444'],
        fill: {
            type: 'gradient',
            gradient: {
                opacityFrom: 0.91,
                opacityTo: 0.1,
            },
        },
        xaxis: {
            type: 'datetime',
            labels: {
                formatter: function (val, timestamp) {
                    return moment(timestamp).format('DD/MM');
                },
            },
        },
        yaxis: {
            labels: {
                formatter: function (value) {
                    return value / 1000;
                },
            },
            tickAmount: 2,
        },
        legend: {
            show: false,
        },
    });

    const [APIFlag, setAPIFlag] = useState(false);
    const [APILocFlag, setAPILocFlag] = useState(false);
    const [showEquipmentChart, setShowEquipmentChart] = useState(false);
    const handleChartOpen = () => setShowEquipmentChart(true);
    const handleChartClose = () => setShowEquipmentChart(false);
    const [selectedEquipmentId, setSelectedEquipmentId] = useState('');
    const [removeEquipmentId, setRemovedEquipmentId] = useState('');
    const [equipmentListArray, setEquipmentListArray] = useState([]);
    const [allEquipmentData, setAllEquipmenData] = useState([]);

    const [exploreTableData, setExploreTableData] = useState([]);

    const [topEnergyConsumption, setTopEnergyConsumption] = useState(1);
    const [topPeakConsumption, setTopPeakConsumption] = useState(1);
    const [floorListAPI, setFloorListAPI] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState([]);
    const [selectedEquipType, setSelectedEquipType] = useState([]);
    const [selectedEndUse, setSelectedEndUse] = useState([]);
    const [selectedSpaceType, setSelectedSpaceType] = useState([]);
    const [equipmentFilter, setEquipmentFilter] = useState({});
    const [minConValue, set_minConValue] = useState(0.0);
    const [maxConValue, set_maxConValue] = useState(0.0);
    const [minPerValue, set_minPerValue] = useState(0);
    const [maxPerValue, set_maxPerValue] = useState(100);
    const [spaceType, setSpaceType] = useState([]);
    const [removeDuplicateFlag, setRemoveDuplicateFlag] = useState(false);
    const [equipmentSearchTxt, setEquipmentSearchTxt] = useState('');

    const [consumptionTxt, setConsumptionTxt] = useState('');
    const [locationTxt, setLocationTxt] = useState('');
    const [spaceTxt, setSpaceTxt] = useState('');
    const [equipmentTxt, setEquipmentTxt] = useState('');
    const [endUseTxt, setEndUseTxt] = useState('');
    const [removeDuplicateTxt, setRemoveDuplicateTxt] = useState('');

    const [showDropdown, setShowDropdown] = useState(false);
    const setDropdown = () => {
        setShowDropdown(!showDropdown)
        if(minConValue!==0 && maxConValue!==topEnergyConsumption && (!showDropdown!==true)){
            setAPIFlag(!APIFlag);
            setConsumptionTxt(`${minConValue} - ${maxConValue} kWh Used`)
        }
    }

    const handleAllEquip = (e) => {
        let slt = document.getElementById('allEquipType');
        if (slt.checked === true) {
            let selectEquip = [];
            for (let i = 0; i < filteredEquipOptions.length; i++) {
                selectEquip.push(filteredEquipOptions[i].value);
                let check = document.getElementById(filteredEquipOptions[i].value);
                check.checked = slt.checked;
            }
            if(filteredEquipOptions.length===1){
                setEquipmentTxt(`${filteredEquipOptions[0].label}`)
            }
            else if(filteredEquipOptions.length===0){
                setEquipmentTxt('')
            }
            else{
                setEquipmentTxt(`${filteredEquipOptions.length} Equipment Types`)
            }
            //console.log('selected Equip Type ',selectEquip);
            setSelectedEquipType(selectEquip);
        } else {
            setSelectedEquipType([]);
            for (let i = 0; i < filteredEquipOptions.length; i++) {
                let check = document.getElementById(filteredEquipOptions[i].value);
                check.checked = slt.checked;
            }
            setEquipmentTxt('');
        }
    };

    const handleSelectedEquip = (e,equipName) => {
        let selection = document.getElementById(e.target.value);
        if (selection.checked === true){
            if(selectedEquipType.length===0){
                setEquipmentTxt(`${equipName}`)
            }
            else{
                setEquipmentTxt(`${selectedEquipType.length+1} Equipment Types`)
            }
            setSelectedEquipType([...selectedEquipType, e.target.value]);
        }
        else {
            let slt = document.getElementById('allEquipType');
            slt.checked = selection.checked;
            if(selectedEquipType.length===1){
                setEquipmentTxt("")
            }
            else if(selectedEquipType.length===2){
                let arr = selectedEquipType.filter(function (item) {
                    return item !== e.target.value;
                });
                let arr1 = filteredEquipOptions.filter(function (item) {
                    return item.value === arr[0];
                });
                console.log(arr1);
                console.log(arr);

                setEquipmentTxt(`${arr1[0].label}`)
            }
            else{
                setEquipmentTxt(`${selectedEquipType.length-1} Equipment Types`)
            }
            //console.log(e.target.value);
            let arr = selectedEquipType.filter(function (item) {
                return item !== e.target.value;
            });
            //console.log(arr);
            setSelectedEquipType(arr);
        }
    };

    const handleAllEndUse = (e) => {
        let slt = document.getElementById('allEndUse');
        if (slt.checked === true) {
            let selectEndUse = [];
            for (let i = 0; i < filteredEndUseOptions.length; i++) {
                selectEndUse.push(filteredEndUseOptions[i].value);
                let check = document.getElementById(filteredEndUseOptions[i].value);
                check.checked = slt.checked;
            }

            if(filteredEndUseOptions.length===1){
                setEndUseTxt(`${filteredEndUseOptions[0].label}`)
            }
            else if(filteredEndUseOptions.length===0){
                setEndUseTxt('')
            }
            else{
                setEndUseTxt(`${filteredEndUseOptions.length} End Use Category`)
            }
            //console.log('selected End Use ',selectEndUse);
            setSelectedEndUse(selectEndUse);
        } else {
            setSelectedEndUse([]);
            for (let i = 0; i < filteredEndUseOptions.length; i++) {
                let check = document.getElementById(filteredEndUseOptions[i].value);
                check.checked = slt.checked;
            }
            setEndUseTxt('');
        }
    };

    const handleSelectedEndUse = (e, endUseName) => {
        let selection = document.getElementById(e.target.value);
        if (selection.checked === true){
            if(selectedEndUse.length===0){
                setEndUseTxt(`${endUseName}`)
            }
            else{
                setEndUseTxt(`${selectedEndUse.length+1} End Use Category`)
            }
            setSelectedEndUse([...selectedEndUse, e.target.value]);
        }
        else {
            let slt = document.getElementById('allEndUse');
            slt.checked = selection.checked;
            //console.log(e.target.value);
            if(selectedEndUse.length===1){
                setEndUseTxt("")
            }
            else if(selectedEndUse.length===2){
                let arr = selectedEndUse.filter(function (item) {
                    return item !== e.target.value;
                });
                let arr1 = filteredEndUseOptions.filter(function (item) {
                    return item.value === arr[0];
                });
                console.log(arr1);
                console.log(arr);

                setEndUseTxt(`${arr1[0].label}`)
            }
            else{
                setEndUseTxt(`${selectedEndUse.length-1} End Use category`)
            }
            let arr = selectedEndUse.filter(function (item) {
                return item !== e.target.value;
            });
            //console.log(arr);
            setSelectedEndUse(arr);
        }
    };

    const handleAllLocation = (e) => {
        let slt = document.getElementById('allLocation');
        if (slt.checked === true) {
            let selectLoc = [];
            for (let i = 0; i < floorListAPI.length; i++) {
                //console.log(floorListAPI[i].floor_id)
                selectLoc.push(floorListAPI[i].floor_id);
                let check = document.getElementById(floorListAPI[i].floor_id);
                check.checked = slt.checked;
            }
            if(floorListAPI.length===1){
                setLocationTxt(`${floorListAPI[0].name}`)
            }
            else if(floorListAPI.length===0){
                setLocationTxt('')
            }
            else{
                setLocationTxt(`${floorListAPI.length} Locations`)
            }
            //console.log('selected Space Type ',selectLoc);
            setSelectedLocation(selectLoc);
        } else {
            setSelectedLocation([]);
            for (let i = 0; i < floorListAPI.length; i++) {
                let check = document.getElementById(floorListAPI[i].floor_id);
                check.checked = slt.checked;
            }
            setLocationTxt('');
        }
    };

    const handleSelectedLocation = (e, locName) => {
        let selection = document.getElementById(e.target.value);
        if (selection.checked === true){
            if(selectedLocation.length===0){
                setLocationTxt(`${locName}`)
            }
            else{
                setLocationTxt(`${selectedLocation.length+1} Locations`)
            }
            setSelectedLocation([...selectedLocation, e.target.value]);
        }
        else {
            if(selectedLocation.length===1){
                setLocationTxt("")
            }
            else if(selectedLocation.length===2){
                let arr = selectedLocation.filter(function (item) {
                    return item !== e.target.value;
                });
                let arr1 = floorListAPI.filter(function (item) {
                    return item.floor_id === arr[0];
                });
                console.log(arr1);
                console.log(arr);

                setLocationTxt(`${arr1[0].name}`)
            }
            else{
                setLocationTxt(`${selectedLocation.length-1} Locations`)
            }
            //console.log(e.target.value);
            let arr = selectedLocation.filter(function (item) {
                return item !== e.target.value;
            });
            //console.log(arr);
            setSelectedLocation(arr);
        }
    };

    const handleAllSpaceType = (e) => {
        let slt = document.getElementById('allSpaceType');
        if (slt.checked === true) {
            let selectSpace = [];
            for (let i = 0; i < filteredSpaceTypeOptions.length; i++) {
                selectSpace.push(filteredSpaceTypeOptions[i].value);
                let check = document.getElementById(filteredSpaceTypeOptions[i].value);
                check.checked = slt.checked;
            }
            if(filteredSpaceTypeOptions.length===1){
                setSpaceTxt(`${filteredSpaceTypeOptions[0].label}`)
            }
            else if(filteredSpaceTypeOptions.length===0){
                setSpaceTxt('')
            }
            else{
                setSpaceTxt(`${filteredSpaceTypeOptions.length} Space Types`)
            }
            //console.log('selected Space Type ',selectSpace);
            setSelectedSpaceType(selectSpace);
        } else {
            setSelectedSpaceType([]);
            for (let i = 0; i < filteredSpaceTypeOptions.length; i++) {
                let check = document.getElementById(filteredSpaceTypeOptions[i].value);
                check.checked = slt.checked;
            }
            setSpaceTxt('')
        }
    };

    const handleSelectedSpaceType = (e,spaceName) => {
        let selection = document.getElementById(e.target.value);
        if (selection.checked === true){
            if(selectedSpaceType.length===0){
                setSpaceTxt(`${spaceName}`)
            }
            else{
                setSpaceTxt(`${selectedSpaceType.length+1} Space Types`)
            }
            setSelectedSpaceType([...selectedSpaceType, e.target.value]);
        } 
        else {
            let slt = document.getElementById('allSpaceType');
            slt.checked = selection.checked;
            if(selectedSpaceType.length===1){
                setSpaceTxt("")
            }
            else if(selectedSpaceType.length===2){
                let arr = selectedSpaceType.filter(function (item) {
                    return item !== e.target.value;
                });
                let arr1 = filteredSpaceTypeOptions.filter(function (item) {
                    return item.value === arr[0];
                });
                console.log(arr1);
                console.log(arr);

                setSpaceTxt(`${arr1[0].label}`)
            }
            else{
                setSpaceTxt(`${selectedSpaceType.length-1} Space Types`)
            }

            //console.log(e.target.value);
            let arr = selectedSpaceType.filter(function (item) {
                return item !== e.target.value;
            });
            //console.log(arr);
            setSelectedSpaceType(arr);
        }
    };

    const handleInput = (values) => {
        //console.log("values ",values);
        set_minConValue(values[0]);
        set_maxConValue(values[1]);
    };

    const handleInputPer = (values) => {
        //console.log("values ",values);
        set_minPerValue(values[0]);
        set_maxPerValue(values[1]);
    };

    const exploreFilterDataFetch = async (bodyVal,txt) => {
        try {
            setIsExploreDataLoading(true);
            let headers = {
                'Content-Type': 'application/json',
                accept: 'application/json',
                Authorization: `Bearer ${userdata.token}`,
            };

            let params = `?consumption=energy&building_id=${bldgId}`;

            await axios.post(`${BaseUrl}${getExploreEquipmentList}${params}`, bodyVal, { headers }).then((res) => {
                let responseData = res.data;
                        setPaginationData(res.data);
                        setSeriesData([]);
                        setSeriesLineData([]);
                        if(txt==="consumption" || txt==="endUse")
                            removeDuplicatesEndUse(txt, responseData.data);
                if (responseData.data.length !== 0) {
                    //setTopEnergyConsumption(responseData.data[0].consumption.now);
                    //setTopPeakConsumption(responseData.data[0].peak_power.now);
                    // set_minConValue(0);
                    // set_maxConValue(responseData.data[0].consumption.now)
                }
                setExploreTableData(responseData.data);

                setIsExploreDataLoading(false);
            });
        } catch (error) {
            console.log(error);
            console.log('Failed to fetch Explore Data');
            setIsExploreDataLoading(false);
        }
    };

    const uniqueIds = [];
    const [removeEqupimentTypesDuplication, setRemoveEqupimentTypesDuplication] = useState();

    const uniqueEndUseIds = [];
    const [removeEndUseDuplication, setRemoveEndUseDuplication] = useState();

    const uniqueLocationIds = [];
    const [removeLocationDuplication, setRemoveLocationDuplication] = useState();
    const uniqueSpaceTypeIds = [];
    const [removeSpaceTypeDuplication, setRemoveSpaceTyepDuplication] = useState();

    const removeDuplicates = () => {
        const uniqueEqupimentTypes = exploreTableData.filter((element) => {
            const isDuplicate = uniqueIds.includes(element.equipments_type);
            if (!isDuplicate) {
                uniqueIds.push(element.equipments_type);
                return true;
            }
            return false;
        });
        const uniqueEndUse = exploreTableData.filter((element) => {
            const isDuplicate = uniqueEndUseIds.includes(element?.end_user);

            if (!isDuplicate) {
                uniqueEndUseIds.push(element?.end_user);
                return true;
            }
            return false;
        });
        const uniqueLocation = exploreTableData.filter((element) => {
            const isDuplicate = uniqueLocationIds.includes(element?.location);

            if (!isDuplicate) {
                uniqueLocationIds.push(element?.location);
                return true;
            }
            return false;
        });
        const uniqueSpaceType = exploreTableData.filter((element) => {
            const isDuplicate = uniqueSpaceTypeIds.includes(element?.location_type);

            if (!isDuplicate) {
                uniqueSpaceTypeIds.push(element?.location_type);
                return true;
            }
            return false;
        });

        setRemoveEndUseDuplication(uniqueEndUse);
        // console.log("Unique End Use ",uniqueEndUse);
        // console.log("Unique Equipment Type ", uniqueEqupimentTypes)
        // console.log("Unique location ", uniqueLocation)
        // console.log("Unique Space Type ",uniqueSpaceType)

        setRemoveEqupimentTypesDuplication(uniqueEqupimentTypes);
        setRemoveLocationDuplication(uniqueLocation);
        setRemoveSpaceTyepDuplication(uniqueSpaceType);
    };

    useEffect(() => {
        // console.log("exploreTableData")
        if (exploreTableData.length === 0) {
            setRemoveEndUseDuplication([]);
            setRemoveEqupimentTypesDuplication([]);
            setRemoveLocationDuplication([]);
            setRemoveSpaceTyepDuplication([]);
        } else removeDuplicates();
    }, [removeDuplicateFlag]);

    useEffect(() => {
        if (startDate === null) {
            return;
        }
        if (endDate === null) {
            return;
        }
        const headers = {
            'Content-Type': 'application/json',
            accept: 'application/json',
            Authorization: `Bearer ${userdata.token}`,
        };
        const params = `?building_id=${bldgId}`;
        axios.get(`${BaseUrl}${getFloors}${params}`, { headers }).then((res) => {
            setFloorListAPI(res.data.data);
        });
        const fetchSpacetypes = async () => {
            const headers = {
                'Content-Type': 'application/json',
                accept: 'application/json',
                Authorization: `Bearer ${userdata.token}`,
            };
            axios.get(`${BaseUrl}${getSpaceTypes}`, { headers }).then((res) => {
                let response = res?.data?.data?.[0]?.generic_spacetypes;
                // console.log(response);
                setSpaceType(response);
                // response.sort((a, b) => {
                //     return a.name.localeCompare(b.name);
                // });
                // setFloor1(response);
            });
        };
        const fetchEquipTypeData = async () => {
            try {
                let headers = {
                    'Content-Type': 'application/json',
                    accept: 'application/json',
                    Authorization: `Bearer ${userdata.token}`,
                };
                let params = `?building_id=${bldgId}`;
                await axios.get(`${BaseUrl}${equipmentType}${params}`, { headers }).then((res) => {
                    let response = res.data.data;
                    let equipData = [];
                    for (var i = 0; i < response.length; i++) {
                        let rec = { label: response[i].equipment_type, value: response[i].equipment_id };
                        equipData.push(rec);
                    }
                    // console.log("equipData ",equipData)
                    setEquipOptions(equipData);
                    // response.sort((a, b) => {
                    //     return a.equipment_type.localeCompare(b.equipment_type);
                    // });
                    // setEquipmentTypeData(response);
                });
            } catch (error) {
                console.log(error);
                console.log('Failed to fetch Equipment Type Data');
            }
        };
        const fetchEndUseData = async () => {
            try {
                let headers = {
                    'Content-Type': 'application/json',
                    accept: 'application/json',
                    Authorization: `Bearer ${userdata.token}`,
                };
                await axios.get(`${BaseUrl}${getEndUseId}`, { headers }).then((res) => {
                    let response = res.data;
                    let equipData = [];
                    for (var i = 0; i < response.length; i++) {
                        let rec = { label: response[i].name, value: response[i].end_user_id };
                        equipData.push(rec);
                    }
                    // console.log("equipData ",equipData)
                    setEndUseOptions(equipData);
                });
            } catch (error) {
                console.log(error);
                console.log('Failed to fetch End Use Data');
            }
        };

        const exploreDataFetch = async (bodyVal) => {
            try {
                setIsExploreDataLoading(true);
                let headers = {
                    'Content-Type': 'application/json',
                    accept: 'application/json',
                    Authorization: `Bearer ${userdata.token}`,
                };

                let params = `?consumption=energy&building_id=${bldgId}`;

                await axios.post(`${BaseUrl}${getExploreEquipmentList}${params}`, bodyVal, { headers }).then((res) => {
                    let responseData = res.data;
                    setPaginationData(res.data);
                    if (responseData.data.length !== 0) {
                        setSeriesData([]);
                        setSeriesLineData([]);
                        setTopEnergyConsumption(responseData.data[0].consumption.now);
                        setTopPeakConsumption((responseData.data[0].peak_power.now / 100000).toFixed(2));
                        set_minConValue(0.0);
                        set_maxConValue((responseData.data[0].consumption.now / 1000).toFixed(2));
                    }
                    setExploreTableData(responseData.data);
                    setRemoveDuplicateFlag(!removeDuplicateFlag);
                    setIsExploreDataLoading(false);
                });
            } catch (error) {
                console.log(error);
                console.log('Failed to fetch Explore Data');
                setIsExploreDataLoading(false);
            }
        };
        let arr = {
            date_from: startDate,
            date_to: endDate,
        };
        exploreDataFetch(arr);
        fetchEquipTypeData();
        fetchEndUseData();
        fetchSpacetypes();
    }, [startDate, endDate, bldgId]);


    const nextPageData = async (path) => {
        // console.log("next path ",path);
        try {
            setIsExploreDataLoading(true);
            if (path === null) {
                return;
            }
            let headers = {
                'Content-Type': 'application/json',
                accept: 'application/json',
                Authorization: `Bearer ${userdata.token}`,
            };
            let arr = {
                date_from: startDate,
                date_to: endDate,
            };
            let params = `?consumption=energy&building_id=${bldgId}`;
            await axios.post(`${BaseUrl}${path}`, arr ,{ headers }).then((res) => {
                let responseData = res.data;
                setPaginationData(res.data);
                if (responseData.data.length !== 0) {
                    setSeriesData([]);
                        setSeriesLineData([]);
                    setTopEnergyConsumption(responseData.data[0].consumption.now);
                    setTopPeakConsumption((responseData.data[0].peak_power.now / 100000).toFixed(2));
                    set_minConValue(0.0);
                    set_maxConValue((responseData.data[0].consumption.now / 1000).toFixed(2));
                }
                setExploreTableData(responseData.data);
                setRemoveDuplicateFlag(!removeDuplicateFlag);
                setIsExploreDataLoading(false);
            });
        } catch (error) {
            console.log(error);
            console.log('Failed to fetch Explore by equipment');
            setIsExploreDataLoading(false);
        }
    };

    const previousPageData = async (path) => {
        try {
            setIsExploreDataLoading(true);
            if (path === null) {
                return;
            }
            let headers = {
                'Content-Type': 'application/json',
                accept: 'application/json',
                Authorization: `Bearer ${userdata.token}`,
            };
            let arr = {
                date_from: startDate,
                date_to: endDate,
            };
            let params = `?consumption=energy&building_id=${bldgId}`;
            await axios.post(`${BaseUrl}${path}`, arr ,{ headers }).then((res) => {
                let responseData = res.data;
                setPaginationData(res.data);
                if (responseData.data.length !== 0) {
                    setSeriesData([]);
                        setSeriesLineData([]);
                    setTopEnergyConsumption(responseData.data[0].consumption.now);
                    setTopPeakConsumption((responseData.data[0].peak_power.now / 100000).toFixed(2));
                    set_minConValue(0.0);
                    set_maxConValue((responseData.data[0].consumption.now / 1000).toFixed(2));
                }
                setExploreTableData(responseData.data);
                setRemoveDuplicateFlag(!removeDuplicateFlag);
                setIsExploreDataLoading(false);
            });
        } catch (error) {
            console.log(error);
            console.log('Failed to fetch Explore by equipment');
            setIsExploreDataLoading(false);
        }
    };


    const [filteredEquipOptions, setFilteredEquipOptions] = useState([]);
    const [filteredEquipOptionsCopy, setFilteredEquipOptionsCopy] = useState([]);
    useEffect(() => {
        if (equipOptions.length === 0 || removeEqupimentTypesDuplication.length === 0) {
            setFilteredEquipOptions([]);
            setFilteredEquipOptionsCopy([]);
            return;
        }
        let rvmEquip = [];
        for (var i = 0; i < removeEqupimentTypesDuplication.length; i++) {
            let arr = equipOptions.filter(function (item) {
                return item.label === removeEqupimentTypesDuplication[i].equipments_type;
            });
            let rec = { label: arr[0].label, value: arr[0].value };
            rvmEquip.push(rec);
            // arr1 = seriesData.filter(function (item) {
            //     return item.id !== removeEquipmentId
            // })
        }
        // console.log(rvmEquip);
        setFilteredEquipOptions(rvmEquip);
        setFilteredEquipOptionsCopy(rvmEquip);
    }, [equipOptions, removeEqupimentTypesDuplication]);

    const [filteredEndUseOptions, setFilteredEndUseOptions] = useState([]);
    const [filteredEndUseOptionsCopy, setFilteredEndUseOptionsCopy] = useState([]);

    useEffect(() => {
        if (endUseOptions.length === 0 || removeEndUseDuplication.length === 0) {
            setFilteredEndUseOptions([]);
            setFilteredEndUseOptionsCopy([]);
            return;
        }
        let rvmEndUse = [];
        for (var i = 0; i < removeEndUseDuplication.length; i++) {
            let arr = endUseOptions.filter(function (item) {
                return item.label === removeEndUseDuplication[i].end_user;
            });
            let rec = { label: arr[0].label, value: arr[0].value };
            rvmEndUse.push(rec);
            // arr1 = seriesData.filter(function (item) {
            //     return item.id !== removeEquipmentId
            // })
        }
        // console.log(rvmEndUse);
        setFilteredEndUseOptions(rvmEndUse);
        setFilteredEndUseOptionsCopy(rvmEndUse);
    }, [endUseOptions, removeEndUseDuplication]);

    const [filteredLocationOptions, setFilteredLocationOptions] = useState([]);
    const [filteredLocationOptionsCopy, setFilteredLocationOptionsCopy] = useState([]);
    useEffect(() => {
        if (floorListAPI.length === 0 || removeLocationDuplication.length === 0) {
            setFilteredLocationOptions([]);
            setFilteredLocationOptionsCopy([]);
            return;
        }
        let rvmLocation = [];
        for (var i = 0; i < removeLocationDuplication.length; i++) {
            for (var j = 0; j < floorListAPI.length; j++) {
                if (removeLocationDuplication[i].location.includes(floorListAPI[j].name))
                    rvmLocation.push(floorListAPI[j]);
            }
        }
        // console.log(rvmLocation);
        setFilteredLocationOptions(rvmLocation);
        setFilteredLocationOptionsCopy(rvmLocation);
    }, [floorListAPI, removeLocationDuplication]);

    const [filteredSpaceTypeOptions, setFilteredSpaceTypeOptions] = useState([]);
    const [filteredSpaceTypeOptionsCopy, setFilteredSpaceTypeOptionsCopy] = useState([]);

    useEffect(() => {
        if (spaceType.length === 0 || removeSpaceTypeDuplication.length === 0) {
            setFilteredSpaceTypeOptions([]);
            setFilteredSpaceTypeOptionsCopy([]);
            return;
        }
        let rvmSpaceType = [];
        for (var i = 0; i < removeSpaceTypeDuplication.length; i++) {
            let arr = spaceType.filter(function (item) {
                return item.name === removeSpaceTypeDuplication[i].location_type;
            });
            if (arr.length > 0) {
                let rec = { label: arr[0].name, value: arr[0].id };
                rvmSpaceType.push(rec);
            }
            // arr1 = seriesData.filter(function (item) {
            //     return item.id !== removeEquipmentId
            // })
        }
        // console.log(rvmSpaceType);
        setFilteredSpaceTypeOptions(rvmSpaceType);
        setFilteredSpaceTypeOptionsCopy(rvmSpaceType);
    }, [spaceType, removeSpaceTypeDuplication]);

    useEffect(() => {
        const updateBreadcrumbStore = () => {
            BreadcrumbStore.update((bs) => {
                let newList = [
                    {
                        label: 'Building View',
                        path: '/explore-page/by-equipment',
                        active: true,
                    },
                ];
                bs.items = newList;
            });
            ComponentStore.update((s) => {
                s.parent = 'explore';
            });
        };
        updateBreadcrumbStore();
        localStorage.removeItem('explorer');
    }, []);

    useEffect(() => {
        // console.log('Entered selected Equipment id ', selectedEquipmentId);
        if (selectedEquipmentId === '') {
            return;
        }
        const fetchExploreChartData = async () => {
            try {
                // setIsExploreDataLoading(true);
                let headers = {
                    'Content-Type': 'application/json',
                    accept: 'application/json',
                    Authorization: `Bearer ${userdata.token}`,
                };
                let params = `?consumption=energy&equipment_id=${selectedEquipmentId}&tz_info=${timeZone}`;
                await axios
                    .post(
                        `${BaseUrl}${getExploreEquipmentChart}${params}`,
                        {
                            date_from: startDate,
                            date_to: endDate,
                        },
                        { headers }
                    )
                    .then((res) => {
                        let responseData = res.data;
                        // console.log(responseData);
                        let data = responseData.data;
                        // console.log(data);
                        let arr = [];
                        arr = exploreTableData.filter(function (item) {
                            return item.equipment_id === selectedEquipmentId;
                        });
                        // console.log(arr);
                        let exploreData = [];

                        let recordToInsert = {
                            name: arr[0].equipment_name,
                            data: data,
                            id: arr[0].equipment_id,
                        };
                        // console.log(recordToInsert);
                        const arrayColumn = (arr, n) => arr.map(x => x[n]);
                        console.log(arrayColumn(data, 0))

                        setSeriesData([...seriesData, recordToInsert]);
                        setSeriesLineData([...seriesLineData, recordToInsert]);
                        setSelectedEquipmentId('');

                        //setIsExploreDataLoading(false);
                    });
            } catch (error) {
                console.log(error);
                console.log('Failed to fetch Explore Data');
                //setIsExploreDataLoading(false);
            }
        };
        fetchExploreChartData();
    }, [selectedEquipmentId]);

    useEffect(() => {
        // console.log('Entered Remove Equipment ', removeEquipmentId);
        if (removeEquipmentId === '') {
            return;
        }
        let arr1 = [];
        arr1 = seriesData.filter(function (item) {
            return item.id !== removeEquipmentId;
        });
        // console.log(arr1);
        setSeriesData(arr1);
        setSeriesLineData(arr1);
    }, [removeEquipmentId]);

    const dataarr = [];

    const fetchExploreAllChartData = async (id) => {
        try {
            // setIsExploreDataLoading(true);
            let headers = {
                'Content-Type': 'application/json',
                accept: 'application/json',
                Authorization: `Bearer ${userdata.token}`,
            };
            let params = `?consumption=energy&equipment_id=${id}`;
            await axios
                .post(
                    `${BaseUrl}${getExploreEquipmentChart}${params}`,
                    {
                        date_from: startDate,
                        date_to: endDate,
                    },
                    { headers }
                )
                .then((res) => {
                    let responseData = res.data;
                    // console.log(responseData);
                    let data = responseData.data;
                    // console.log(data);
                    let arr = [];
                    arr = exploreTableData.filter(function (item) {
                        return item.equipment_id === id;
                    });
                    // console.log(arr);
                    let exploreData = [];
                    // data.forEach((record) => {
                    //     if (record.building_name !== null) {
                    let recordToInsert = {
                        name: arr[0].equipment_name,
                        data: data,
                        id: arr[0].equipment_id,
                    };
                    // console.log(recordToInsert);
                    dataarr.push(recordToInsert);
                    // console.log(dataarr);
                    setAllEquipmenData(dataarr);
                });
        } catch (error) {
            console.log(error);
            console.log('Failed to fetch Explore Data');
            //setIsExploreDataLoading(false);
        }
    };
    useEffect(() => {
        // console.log('building List Array ', equipmentListArray);
        if (equipmentListArray.length === 0) {
            return;
        }
        for (var i = 0; i < equipmentListArray.length; i++) {
            let arr1 = [];
            arr1 = seriesData.filter(function (item) {
                return item.id === equipmentListArray[i];
            });
            // console.log('Arr 1 ', arr1);
            if (arr1.length === 0) {
                fetchExploreAllChartData(equipmentListArray[i]);
                // console.log(dataarr);
            }
        }
    }, [equipmentListArray]);
    useEffect(() => {
        if (allEquipmentData.length === 0) {
            return;
        }
        // console.log('allEquipmentSData ', allEquipmentData);
        if (allEquipmentData.length === exploreTableData.length) {
            // console.log('All equipment Data set');
            setSeriesData(allEquipmentData);
            setSeriesLineData(allEquipmentData);
        }
    }, [allEquipmentData]);

    const handleCloseFilter = (e, val) => {
        let arr = [];
        arr = selectedOptions.filter(function (item) {
            return item.value !== val;
        });
        // console.log(arr);
        setSelectedOptions(arr);
        let txt="";
        let arr1 = {};
        arr1['date_from'] = startDate;
        arr1['date_to'] = endDate;
        let topVal = (topEnergyConsumption / 1000).toFixed(3);
        switch (val) {
            case 'consumption':
                if (selectedLocation.length !== 0) {
                    arr1['location'] = selectedLocation;
                }
                if (selectedEquipType.length !== 0) {
                    arr1['equipment_types'] = selectedEquipType;
                }
                if (selectedEndUse.length !== 0) {
                    arr1['end_use'] = selectedEndUse;
                }
                if (selectedSpaceType.length !== 0) {
                    arr1['space_type'] = selectedSpaceType;
                }
                txt="consumption"
                set_minConValue(0.0);
                set_maxConValue(topVal);
                break;
            case 'location':
                setSelectedLocation([]);
                if (maxConValue > 0.01 && (maxConValue !== topVal || minConValue !== 0.0)) {
                    arr1['consumption_range'] = {
                        gte: minConValue * 1000,
                        lte: maxConValue * 1000,
                    };
                }
                if (selectedEquipType.length !== 0) {
                    arr1['equipment_types'] = selectedEquipType;
                }
                if (selectedEndUse.length !== 0) {
                    arr1['end_use'] = selectedEndUse;
                }
                if (selectedSpaceType.length !== 0) {
                    arr1['space_type'] = selectedSpaceType;
                }
                break;
            case 'equip_type':
                setSelectedEquipType([]);
                if (maxConValue > 0.01 && (maxConValue !== topVal || minConValue !== 0.0)) {
                    arr1['consumption_range'] = {
                        gte: minConValue * 1000,
                        lte: maxConValue * 1000,
                    };
                }
                if (selectedEndUse.length !== 0) {
                    arr1['end_use'] = selectedEndUse;
                }
                if (selectedLocation.length !== 0) {
                    arr1['location'] = selectedLocation;
                }
                if (selectedSpaceType.length !== 0) {
                    arr1['space_type'] = selectedSpaceType;
                }
                break;
            case 'endUse_category':
                setSelectedEndUse([]);
                if (maxConValue > 0.01 && (maxConValue !== topVal || minConValue !== 0.0)) {
                    arr1['consumption_range'] = {
                        gte: minConValue * 1000,
                        lte: maxConValue * 1000,
                    };
                }
                if (selectedEquipType.length !== 0) {
                    arr1['equipment_types'] = selectedEquipType;
                }
                if (selectedLocation.length !== 0) {
                    arr1['location'] = selectedLocation;
                }
                if (selectedSpaceType.length !== 0) {
                    arr1['space_type'] = selectedSpaceType;
                }
                txt="endUse"
                break;
            case 'location_type':
                setSelectedSpaceType([]);
                if (maxConValue > 0.01 && (maxConValue !== topVal || minConValue !== 0.0)) {
                    arr1['consumption_range'] = {
                        gte: minConValue * 1000,
                        lte: maxConValue * 1000,
                    };
                }
                if (selectedEquipType.length !== 0) {
                    arr1['equipment_types'] = selectedEquipType;
                }
                if (selectedLocation.length !== 0) {
                    arr1['location'] = selectedLocation;
                }
                if (selectedEndUse.length !== 0) {
                    arr1['end_use'] = selectedEndUse;
                }
                break;
        }
        exploreFilterDataFetch(arr1,txt);
    };

    // useEffect(()=>{
    //     if(minConValue===0 && maxConValue===0 || maxConValue===1){
    //         return;
    //     }
    //    let arr={
    //     date_from: startDate,
    //     date_to: endDate,
    //     consumption_range: {
    //         "gte": minConValue,
    //         "lte": maxConValue
    //       }
    // }

    //     exploreFilterDataFetch(arr);

    // },[APIFlag])
    useEffect(() => {
        if (
            selectedLocation.length === 0 &&
            (maxConValue === 0.0 || maxConValue === 0.01) &&
            selectedEquipType.length === 0 &&
            selectedEndUse.length === 0 &&
            selectedSpaceType.length === 0
        ) {
            return;
        }
        let arr = {};
        let txt="";
        arr['date_from'] = startDate;
        arr['date_to'] = endDate;
        if (maxConValue > 0.01) {
            arr['consumption_range'] = {
                gte: minConValue * 1000,
                lte: maxConValue * 1000,
            };
            txt="consumption";
        }
        if (selectedLocation.length !== 0) {
            arr['location'] = selectedLocation;
        }
        if (selectedEquipType.length !== 0) {
            arr['equipment_types'] = selectedEquipType;
        }
        if (selectedEndUse.length !== 0) {
            arr['end_use'] = selectedEndUse;
            txt="endUse";
        }
        if (selectedSpaceType.length !== 0) {
            arr['space_type'] = selectedSpaceType;
        }
        exploreFilterDataFetch(arr,txt);
    }, [APIFlag, APILocFlag, selectedEquipType, selectedEndUse, selectedSpaceType]);

    const clearFilterData = () => {
        let arr = {
            date_from: startDate,
            date_to: endDate,
        };
        exploreFilterDataFetch(arr);
    };
    const handleEndUseSearch = (e) => {
        let txt = e.target.value;
        if (txt !== '') {
            var search = new RegExp(txt, 'i');
            let b = filteredEndUseOptions.filter((item) => search.test(item.label));
            // console.log(b);
            setFilteredEndUseOptions(b);
        } else {
            setFilteredEndUseOptions(filteredEndUseOptionsCopy);
        }
    };
    const handleSpaceTypeSearch = (e) => {
        let txt = e.target.value;
        if (txt !== '') {
            var search = new RegExp(txt, 'i');
            let b = filteredSpaceTypeOptions.filter((item) => search.test(item.label));
            // console.log(b);
            setFilteredSpaceTypeOptions(b);
        } else {
            setFilteredSpaceTypeOptions(filteredSpaceTypeOptionsCopy);
        }
    };
    const handleEquipTypeSearch = (e) => {
        let txt = e.target.value;
        if (txt !== '') {
            var search = new RegExp(txt, 'i');
            let b = filteredEquipOptions.filter((item) => search.test(item.label));
            // console.log(b);
            setFilteredEquipOptions(b);
        } else {
            setFilteredEquipOptions(filteredEquipOptionsCopy);
        }
    };

    const handleLocationSearch = (e) => {
        let txt = e.target.value;
        if (txt !== '') {
            var search = new RegExp(txt, 'i');
            let b = filteredLocationOptions.filter((item) => search.test(item.name));
            // console.log(b);
            setFilteredLocationOptions(b);
        } else {
            setFilteredLocationOptions(filteredLocationOptionsCopy);
        }
    };

    const handleEquipmentSearch = (e) => {
        // console.log(equipmentSearchTxt);

        const exploreDataFetch = async () => {
            try {
                setIsExploreDataLoading(true);
                let headers = {
                    'Content-Type': 'application/json',
                    accept: 'application/json',
                    Authorization: `Bearer ${userdata.token}`,
                };
                let params = `?consumption=energy&search_by_name=${equipmentSearchTxt}&building_id=${bldgId}`;
                await axios
                    .post(
                        `${BaseUrl}${getExploreEquipmentList}${params}`,
                        {
                            date_from: startDate,
                            date_to: endDate,
                        },
                        { headers }
                    )
                    .then((res) => {
                        let responseData = res.data;
                        if (responseData.data.length !== 0) {
                            setTopEnergyConsumption(responseData.data[0].consumption.now);
                            setTopPeakConsumption((responseData.data[0].peak_power.now / 100000).toFixed(3));
                            set_minConValue(0.0);
                            set_maxConValue((responseData.data[0].consumption.now / 1000).toFixed(3));
                        }
                        setExploreTableData(responseData.data);
                        setRemoveDuplicateFlag(!removeDuplicateFlag);
                        setIsExploreDataLoading(false);
                    });
            } catch (error) {
                console.log(error);
                console.log('Failed to fetch Explore Data');
                setIsExploreDataLoading(false);
            }
        };
        exploreDataFetch();
    };

    const getCSVLinkData = () => {
        // console.log("csv entered");
        let sData = [];
        exploreTableData.map(function (obj) {
            let change = percentageHandler(obj.consumption.now, obj.consumption.old) + '%';
            sData.push([
                obj.equipment_name,
                (obj.consumption.now / 1000).toFixed(2) + 'kWh',
                change,
                obj.location,
                obj.location_type,
                obj.equipments_type,
                obj.end_user,
            ]);
        });
        //console.log(sData)
        //let arr = exploreTableData.length > 0 ? sData : [];
        //console.log(exploreTableData);
        //console.log([exploreTableData]);
        let streamData = exploreTableData.length > 0 ? sData : [];

        // streamData.unshift(['Timestamp', selectedConsumption])

        return [
            [
                'Name',
                'Energy Consumption',
                '% Change',
                'Location',
                'Location Type',
                'Equipment Type',
                'End Use Category',
            ],
            ...streamData,
        ];
    };

    const getCSVLinkChartData = () => {
        // console.log("csv entered");
        let arr = [];
        // console.log(seriesData);
        seriesData.map(function (obj) {
            arr.push([obj.name, obj.data]);
        });
        // console.log(sData);
        let streamData = seriesData.length > 0 ? arr : [];

        // streamData.unshift(['Timestamp', selectedConsumption])

        return [['Equipment Name', ['timestamp', 'energy']], ...streamData];
    };

    useEffect(()=>{
            console.log("showDropdown",showDropdown);
    },[showDropdown])

    const removeDuplicatesEndUse=(txt,tabledata)=>{
        uniqueIds.length=0
        uniqueLocationIds.length=0
        uniqueSpaceTypeIds.length=0
        if(txt==="consumption")
            uniqueEndUseIds.length=0
        const uniqueEqupimentTypes = tabledata.filter((element) => {
            const isDuplicate = uniqueIds.includes(element.equipments_type);
            if (!isDuplicate) {
                uniqueIds.push(element.equipments_type);
                return true;
            }
            return false;
        });
        const uniqueLocation = tabledata.filter((element) => {
            const isDuplicate = uniqueLocationIds.includes(element?.location);

            if (!isDuplicate) {
                uniqueLocationIds.push(element?.location);
                return true;
            }
            return false;
        });
        const uniqueSpaceType = tabledata.filter((element) => {
            const isDuplicate = uniqueSpaceTypeIds.includes(element?.location_type);

            if (!isDuplicate) {
                uniqueSpaceTypeIds.push(element?.location_type);
                return true;
            }
            return false;
        });
        if(txt==="consumption"){
        const uniqueEndUse = tabledata.filter((element) => {
            const isDuplicate = uniqueEndUseIds.includes(element?.end_user);

            if (!isDuplicate) {
                uniqueEndUseIds.push(element?.end_user);
                return true;
            }
            return false;
        });
        
        setRemoveEndUseDuplication(uniqueEndUse)
    }

        // console.log("Unique End Use ",uniqueEndUse);
        // console.log("Unique Equipment Type ", uniqueEqupimentTypes)
        // console.log("Unique location ", uniqueLocation)
        // console.log("Unique Space Type ",uniqueSpaceType)

        setRemoveEqupimentTypesDuplication(uniqueEqupimentTypes);
        setRemoveLocationDuplication(uniqueLocation);
        setRemoveSpaceTyepDuplication(uniqueSpaceType);
    }
    
    

    return (
        <>
            <Row className="ml-2 mt-2 explore-filters-style">
                <Header title="" />
            </Row>

            <Row>
                <div className="explore-table-style">
                    {isExploreChartDataLoading ? (
                        <div className="loader-center-style" style={{ height: '400px' }}>
                            <Spinner className="m-2" color={'primary'} />
                        </div>
                    ) : (
                        <>
                            <Row>
                                <Col lg={11}></Col>
                                <Col lg={1} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                    <CSVLink
                                        style={{ color: 'black' }}
                                        className="btn btn-white d-inline btnHover font-weight-bold"
                                        filename={`explore-building-energy-${new Date().toUTCString()}.csv`}
                                        target="_blank"
                                        data={getCSVLinkChartData()}>
                                        {' '}
                                        <FontAwesomeIcon icon={faDownload} size="md" />
                                    </CSVLink>
                                </Col>
                            </Row>
                            <BrushChart
                                seriesData={seriesData}
                                optionsData={optionsData}
                                seriesLineData={seriesLineData}
                                optionsLineData={optionsLineData}
                            />
                        </>
                    )}
                </div>
            </Row>

            <Row className="mt-3 mb-1">
                <Col lg={11} style={{ display: 'flex', justifyContent: 'flex-start' }}>
                    <div className="explore-search-filter-style">
                        <div className="explore-search mr-2">
                            <input
                                className="search-box ml-2"
                                type="search"
                                name="search"
                                placeholder="Search..."
                                onChange={(e) => {
                                    setEquipmentSearchTxt(e.target.value);
                                }}
                            />
                            <button
                                style={{ border: 'none', backgroundColor: '#fff' }}
                                onClick={(e) => {
                                    handleEquipmentSearch(e);
                                }}>
                                <FontAwesomeIcon icon={faMagnifyingGlass} size="md" />
                            </button>
                        </div>
                        <div>
                            <MultiSelect
                                options={tableColumnOptions}
                                value={selectedOptions}
                                onChange={setSelectedOptions}
                                labelledBy="Columns"
                                className="column-filter-styling"
                                valueRenderer={() => {
                                    return (
                                        <>
                                            <i
                                                className="uil uil-plus mr-1 "
                                                style={{ color: 'black', fontSize: '1rem' }}></i>{' '}
                                            <b style={{ color: 'black', fontSize: '1rem' }}>Add Filter</b>
                                        </>
                                    );
                                }}
                                ClearSelectedIcon={null}
                            />
                        </div>

                        {selectedOptions.map((el, index) => {
                            if (el.value !== 'consumption') {
                                return;
                            }
                            return (
                                <>
                                    <Dropdown className="mt-2 me-1 ml-2 btn btn-white d-inline btnHover" align="end" onToggle={setDropdown}>
                                        <span className="" style={{ height: '36px', marginLeft: '1rem' }}>
                                            <Dropdown.Toggle
                                                className="font-weight-bold"
                                                id="PopoverClick"
                                                type="button"
                                                style={{ border: 'none', backgroundColor: 'white', color: 'black' }}
                                                >
                                                {consumptionTxt === '' ? `All ${el.label}` : consumptionTxt}
                                            </Dropdown.Toggle>
                                            <button
                                                style={{ border: 'none', backgroundColor: 'white' }}
                                                onClick={(e) => {
                                                    handleCloseFilter(e, el.value);
                                                    setConsumptionTxt('');
                                                }}>
                                                <i className="uil uil-multiply"></i>
                                            </button>
                                        </span>
                                        <Dropdown.Menu className="dropdown-lg p-3">
                                            <div style={{ margin: '1rem' }}>
                                                <div>
                                                    <a
                                                        className="pop-text"
                                                        >
                                                        kWh Used
                                                    </a>
                                                    {/* <button
                                                        style={{
                                                            border: 'none',
                                                            backgroundColor: 'white',
                                                            marginLeft: '5rem',
                                                        }}
                                                        onClick={clearFilterData}>
                                                        <i className="uil uil-multiply"></i>
                                                    </button> */}
                                                </div>
                                                <div className="pop-inputbox-wrapper">
                                                    <input className="pop-inputbox" type="text" value={minConValue} />{' '}
                                                    <input className="pop-inputbox" type="text" value={maxConValue} />
                                                </div>
                                                <div style={{ marginTop: '2rem' }}>
                                                    <RangeSlider
                                                        name="consumption"
                                                        STEP={1}
                                                        MIN={0}
                                                        range={[minConValue, maxConValue]}
                                                        MAX={(topEnergyConsumption / 1000 + 0.5).toFixed(2)}
                                                        onSelectionChange={handleInput}
                                                    />
                                                </div>
                                            </div>
                                        </Dropdown.Menu>
                                    </Dropdown>
                                </>
                            );
                        })}
                        {selectedOptions.map((el, index) => {
                            if (el.value !== 'change') {
                                return;
                            }
                            return (
                                <>
                                    <Dropdown className="mt-2 me-1 ml-2 btn btn-white d-inline btnHover" align="end">
                                        <span className="" style={{ height: '36px', marginLeft: '1rem' }}>
                                            <Dropdown.Toggle
                                                className="font-weight-bold"
                                                id="PopoverClick"
                                                type="button"
                                                style={{ border: 'none', backgroundColor: 'white', color: 'black' }}>
                                                {' '}
                                                All {el.label}{' '}
                                            </Dropdown.Toggle>
                                            <button
                                                style={{ border: 'none', backgroundColor: 'white' }}
                                                onClick={(e) => {
                                                    handleCloseFilter(e, el.value);
                                                }}>
                                                <i className="uil uil-multiply"></i>
                                            </button>
                                        </span>
                                        <Dropdown.Menu className="dropdown-lg p-3">
                                            <div style={{ margin: '1rem' }}>
                                                <div>
                                                    <a
                                                        className="pop-text"
                                                        onClick={(e) => {
                                                            setAPIFlag(!APIFlag);
                                                        }}>
                                                        Change Threshold
                                                    </a>
                                                    <button
                                                        style={{
                                                            border: 'none',
                                                            backgroundColor: 'white',
                                                            marginLeft: '5rem',
                                                        }}
                                                        onClick={exploreFilterDataFetch}>
                                                        <i className="uil uil-multiply"></i>
                                                    </button>
                                                </div>
                                                <div className="pop-inputbox-wrapper">
                                                    <input className="pop-inputbox" type="text" value={minPerValue} />{' '}
                                                    <input className="pop-inputbox" type="text" value={maxPerValue} />
                                                </div>
                                                <div style={{ marginTop: '2rem' }}>
                                                    <RangeSlider
                                                        name="consumption"
                                                        STEP={1}
                                                        MIN={0}
                                                        range={[minPerValue, maxPerValue]}
                                                        MAX={100}
                                                        onSelectionChange={handleInputPer}
                                                    />
                                                </div>
                                            </div>
                                        </Dropdown.Menu>
                                    </Dropdown>
                                </>
                            );
                        })}

                        {selectedOptions.map((el, index) => {
                            if (el.value !== 'location') {
                                return;
                            }
                            return (
                                <>
                                    <Dropdown className="mt-2 me-1 ml-2 btn btn-white d-inline btnHover" align="end">
                                        <span className="" style={{ height: '36px', marginLeft: '1rem' }}>
                                            <Dropdown.Toggle
                                                className="font-weight-bold"
                                                id="PopoverClick"
                                                type="button"
                                                style={{ border: 'none', backgroundColor: 'white', color: 'black' }}>
                                                {' '}
                                                {locationTxt === '' ? `All ${el.label}` : locationTxt}{' '}
                                            </Dropdown.Toggle>
                                            <button
                                                style={{ border: 'none', backgroundColor: 'white' }}
                                                onClick={(e) => {
                                                    handleCloseFilter(e, el.value);
                                                    setLocationTxt('');
                                                }}>
                                                <i className="uil uil-multiply"></i>
                                            </button>
                                        </span>
                                        <Dropdown.Menu className="dropdown-xlg p-3">
                                            <div>
                                                <div className="pop-inputbox-wrapper">
                                                    <div className="explore-search mr-2">
                                                        <FontAwesomeIcon icon={faMagnifyingGlass} size="md" />
                                                        <input
                                                            className="search-box ml-2"
                                                            type="search"
                                                            name="search"
                                                            placeholder="Search Locations (floor, area,room)"
                                                            onChange={(e) => {
                                                                handleLocationSearch(e);
                                                            }}
                                                        />
                                                    </div>
                                                    <button
                                                        className="btn btn-white d-inline"
                                                        onClick={clearFilterData}>
                                                        Cancel
                                                    </button>
                                                    <button
                                                        className="btn btn-primary d-inline ml-2"
                                                        onClick={(e) => {
                                                            setAPILocFlag(!APILocFlag);
                                                        }}>
                                                        Save
                                                    </button>
                                                </div>
                                                <div className="pop-inputbox-wrapper mt-4 mb-2 p-1">
                                                    <span className="pop-text">
                                                        {localStorage.getItem('exploreBldName')}
                                                    </span>
                                                </div>
                                                <div
                                                    className={floorListAPI.length > 4 ? `hScroll` : `hHundredPercent`}>
                                                    <div className="floor-box">
                                                        <div>
                                                            <input
                                                                type="checkbox"
                                                                className="mr-2"
                                                                id="allLocation"
                                                                onClick={(e) => {
                                                                    handleAllLocation(e);
                                                                }}
                                                            />
                                                            <span>Select All</span>
                                                        </div>
                                                    </div>
                                                    {floorListAPI.map((record) => {
                                                        return (
                                                            <div className="floor-box">
                                                                <div>
                                                                    <input
                                                                        type="checkbox"
                                                                        className="mr-2"
                                                                        id={record.floor_id}
                                                                        value={record.floor_id}
                                                                        onClick={(e) => {
                                                                            handleSelectedLocation(e, record.name);
                                                                        }}
                                                                    />
                                                                    <span>{record.name}</span>
                                                                </div>
                                                                <div style={{ display: 'flex' }}>
                                                                    {/* <div className='room-box'> 12 Rooms </div> */}
                                                                    <button
                                                                        style={{
                                                                            border: 'none',
                                                                            backgroundColor: 'white',
                                                                        }}>
                                                                        <i className="uil uil-angle-right"></i>
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                                <div></div>
                                            </div>
                                        </Dropdown.Menu>
                                    </Dropdown>
                                </>
                            );
                        })}

                        {selectedOptions.map((el, index) => {
                            if (el.value !== 'location_type') {
                                return;
                            }
                            return (
                                <>
                                    <Dropdown className="mt-2 me-1 ml-2 btn btn-white d-inline btnHover" align="end">
                                        <span className="" style={{ height: '36px', marginLeft: '1rem' }}>
                                            <Dropdown.Toggle
                                                className="font-weight-bold"
                                                id="PopoverClick"
                                                type="button"
                                                style={{ border: 'none', backgroundColor: 'white', color: 'black' }}>
                                                {' '}
                                                {spaceTxt === '' ? `All ${el.label}` : spaceTxt}{' '}
                                            </Dropdown.Toggle>
                                            <button
                                                style={{ border: 'none', backgroundColor: 'white' }}
                                                onClick={(e) => {
                                                    handleCloseFilter(e, el.value);
                                                    setSpaceTxt('');
                                                }}>
                                                <i className="uil uil-multiply"></i>
                                            </button>
                                        </span>
                                        <Dropdown.Menu className="dropdown-lg p-3">
                                            <div>
                                                <div className="m-1">
                                                    <div className="explore-search mr-2">
                                                        <FontAwesomeIcon icon={faMagnifyingGlass} size="md" />
                                                        <input
                                                            className="search-box ml-2"
                                                            type="search"
                                                            name="search"
                                                            placeholder="Search"
                                                            onChange={(e) => {
                                                                handleSpaceTypeSearch(e);
                                                            }}
                                                        />
                                                    </div>
                                                    <div
                                                        className={
                                                            filteredSpaceTypeOptions.length > 4
                                                                ? `hScroll`
                                                                : `hHundredPercent`
                                                        }>
                                                        <div className="floor-box">
                                                            <div>
                                                                <input
                                                                    type="checkbox"
                                                                    className="mr-2"
                                                                    id="allSpaceType"
                                                                    onClick={(e) => {
                                                                        handleAllSpaceType(e);
                                                                    }}
                                                                />
                                                                <span>Select All</span>
                                                            </div>
                                                        </div>
                                                        {filteredSpaceTypeOptions.map((record) => {
                                                            return (
                                                                <div className="floor-box">
                                                                    <div>
                                                                        <input
                                                                            type="checkbox"
                                                                            className="mr-2"
                                                                            id={record.value}
                                                                            value={record.value}
                                                                            onClick={(e) => {
                                                                                handleSelectedSpaceType(e, record.label);
                                                                            }}
                                                                        />
                                                                        <span>{record.label}</span>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                        </Dropdown.Menu>
                                    </Dropdown>
                                </>
                            );
                        })}
                        {selectedOptions.map((el, index) => {
                            if (el.value !== 'equip_type') {
                                return;
                            }
                            return (
                                <>
                                    <Dropdown className="mt-2 me-1 ml-2 btn btn-white d-inline btnHover" align="end">
                                        <span className="" style={{ height: '36px', marginLeft: '1rem' }}>
                                            <Dropdown.Toggle
                                                className="font-weight-bold"
                                                id="PopoverClick"
                                                type="button"
                                                style={{ border: 'none', backgroundColor: 'white', color: 'black' }}>
                                                {' '}
                                                {equipmentTxt === '' ? `All ${el.label}` : equipmentTxt}{' '}
                                            </Dropdown.Toggle>
                                            <button
                                                style={{ border: 'none', backgroundColor: 'white' }}
                                                onClick={(e) => {
                                                    handleCloseFilter(e, el.value);
                                                    setEquipmentTxt('');
                                                }}>
                                                <i className="uil uil-multiply"></i>
                                            </button>
                                        </span>
                                        <Dropdown.Menu className="dropdown-lg p-3">
                                            <div>
                                                <div className="m-1">
                                                    <div className="explore-search mr-2">
                                                        <FontAwesomeIcon icon={faMagnifyingGlass} size="md" />
                                                        <input
                                                            className="search-box ml-2"
                                                            type="search"
                                                            name="search"
                                                            placeholder="Search"
                                                            onChange={(e) => {
                                                                handleEquipTypeSearch(e);
                                                            }}
                                                        />
                                                    </div>
                                                    <div
                                                        className={
                                                            filteredEquipOptions.length > 4
                                                                ? `hScroll`
                                                                : `hHundredPercent`
                                                        }>
                                                        <div className="floor-box">
                                                            <div>
                                                                <input
                                                                    type="checkbox"
                                                                    className="mr-2"
                                                                    id="allEquipType"
                                                                    onClick={(e) => {
                                                                        handleAllEquip(e);
                                                                    }}
                                                                />
                                                                <span>Select All</span>
                                                            </div>
                                                        </div>
                                                        {filteredEquipOptions.map((record) => {
                                                            return (
                                                                <div className="floor-box">
                                                                    <div>
                                                                        <input
                                                                            type="checkbox"
                                                                            className="mr-2"
                                                                            id={record.value}
                                                                            value={record.value}
                                                                            onClick={(e) => {
                                                                                handleSelectedEquip(e, record.label);
                                                                            }}
                                                                        />
                                                                        <span>{record.label}</span>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                        </Dropdown.Menu>
                                    </Dropdown>
                                </>
                            );
                        })}
                        {selectedOptions.map((el, index) => {
                            if (el.value !== 'endUse_category') {
                                return;
                            }
                            return (
                                <>
                                    <Dropdown className="mt-2 me-1 ml-2 btn btn-white d-inline btnHover" align="end">
                                        <span className="" style={{ height: '36px', marginLeft: '1rem' }}>
                                            <Dropdown.Toggle
                                                className="font-weight-bold"
                                                id="PopoverClick"
                                                type="button"
                                                style={{ border: 'none', backgroundColor: 'white', color: 'black' }}>
                                                {' '}
                                                {endUseTxt === '' ? `All ${el.label}` : endUseTxt}{' '}
                                            </Dropdown.Toggle>
                                            <button
                                                style={{ border: 'none', backgroundColor: 'white' }}
                                                onClick={(e) => {
                                                    handleCloseFilter(e, el.value);
                                                    setEndUseTxt('');
                                                }}>
                                                <i className="uil uil-multiply"></i>
                                            </button>
                                        </span>
                                        <Dropdown.Menu className="dropdown-lg p-3">
                                            <div>
                                                <div className="m-1">
                                                    <div className="explore-search mr-2">
                                                        <FontAwesomeIcon icon={faMagnifyingGlass} size="md" />
                                                        <input
                                                            className="search-box ml-2"
                                                            type="search"
                                                            name="search"
                                                            placeholder="Search"
                                                            onChange={(e) => {
                                                                handleEndUseSearch(e);
                                                            }}
                                                        />
                                                    </div>
                                                    <div
                                                        className={
                                                            filteredEndUseOptions.length > 4
                                                                ? `hScroll`
                                                                : `hHundredPercent`
                                                        }>
                                                        <div className="floor-box">
                                                            <div>
                                                                <input
                                                                    type="checkbox"
                                                                    className="mr-2"
                                                                    id="allEndUse"
                                                                    onClick={(e) => {
                                                                        handleAllEndUse(e);
                                                                    }}
                                                                />
                                                                <span>Select All</span>
                                                            </div>
                                                        </div>
                                                        {filteredEndUseOptions.map((record) => {
                                                            return (
                                                                <div className="floor-box">
                                                                    <div>
                                                                        <input
                                                                            type="checkbox"
                                                                            className="mr-2"
                                                                            id={record.value}
                                                                            value={record.value}
                                                                            onClick={(e) => {
                                                                                handleSelectedEndUse(e, record.label);
                                                                            }}
                                                                        />
                                                                        <span>{record.label}</span>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                        </Dropdown.Menu>
                                    </Dropdown>
                                </>
                            );
                        })}
                    </div>
                </Col>
                <Col lg={1} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button className="btn btn-white d-inline btnHover font-weight-bold mr-2">
                        {' '}
                        <FontAwesomeIcon icon={faTableColumns} size="md" />
                    </button>
                    <CSVLink
                        style={{ color: 'black' }}
                        className="btn btn-white d-inline btnHover font-weight-bold"
                        filename={`explore-building-list-${new Date().toUTCString()}.csv`}
                        target="_blank"
                        data={getCSVLinkData()}>
                        {' '}
                        <FontAwesomeIcon icon={faDownload} size="md" />
                    </CSVLink>
                </Col>
            </Row>

            <Row>
                <div className="explore-table-style">
                    <Col lg={12} className="ml-2">
                        <ExploreEquipmentTable
                            exploreTableData={exploreTableData}
                            isExploreDataLoading={isExploreDataLoading}
                            topEnergyConsumption={topEnergyConsumption}
                            topPeakConsumption={topPeakConsumption}
                            handleChartOpen={handleChartOpen}
                            setEquipmentFilter={setEquipmentFilter}
                            selectedEquipmentId={selectedEquipmentId}
                            setSelectedEquipmentId={setSelectedEquipmentId}
                            removeEquipmentId={removeEquipmentId}
                            setRemovedEquipmentId={setRemovedEquipmentId}
                            equipmentListArray={equipmentListArray}
                            setEquipmentListArray={setEquipmentListArray}
                            pageSize={pageSize}
                            setPageSize={setPageSize}
                            paginationData={paginationData}
                            nextPageData={nextPageData}
                            previousPageData={previousPageData}
                        />
                    </Col>
                </div>
            </Row>

            <EquipChartModal
                showEquipmentChart={showEquipmentChart}
                handleChartOpen={handleChartOpen}
                handleChartClose={handleChartClose}
                equipmentFilter={equipmentFilter}
            />
        </>
    );
};

export default ExploreByEquipment;