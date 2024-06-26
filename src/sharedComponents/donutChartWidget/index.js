import React, { useEffect, useRef, useState } from 'react';
import { Spinner } from 'reactstrap';
import ReactDOMServer from 'react-dom/server';
import Highcharts from 'highcharts/highstock';
import HighchartsMore from 'highcharts/highcharts-more';
import HighchartsSolidGauge from 'highcharts/modules/solid-gauge';
import HighchartsExporting from 'highcharts/modules/exporting';
import HighchartsData from 'highcharts/modules/export-data';
import DropDownIcon from '../dropDowns/dropDownButton/DropDownIcon';
import HighchartsReact from 'highcharts-react-official';
import PropTypes from 'prop-types';

import Typography from '../typography';
import Button from '../button/Button';

import DonutChartLabels from './DonutChartLabels';

import { configDonutChartWidget } from './config';
import { getDonutChartCSVExport } from '../helpers/chartsExport';
import { formatConsumptionValue } from '../../helpers/explorehelpers';
import { DOWNLOAD_TYPES } from '../constants';

import { ReactComponent as ArrowRight } from '../assets/icons/arrow-right.svg';
import { ReactComponent as BurgerIcon } from '../../assets/icon/burger.svg';

import './style.scss';
import { onHoverHandler, onUnHoverHandler } from './helper';
import { downloadImage } from '../../helpers/helpers';

HighchartsMore(Highcharts);
HighchartsSolidGauge(Highcharts);
HighchartsExporting(Highcharts);
HighchartsData(Highcharts);

export const DONUT_CHART_TYPES = Object.freeze({
    VERTICAL: 'vertical',
    HORIZONTAL: 'horizontal',
});

const Titles = ({ title, subtitle }) => {
    return (
        <>
            <div className={`ml-3 mt-3`}>
                <Typography.Subheader
                    size={Typography.Sizes.md}
                    as="h5"
                    fontWeight={Typography.Types.Medium}
                    className="mb-0 mt-0">
                    {title}
                </Typography.Subheader>
                <Typography.Body size={Typography.Sizes.xs} as="h6">
                    {subtitle}
                </Typography.Body>
            </div>
        </>
    );
};

const DonutChartWidget = ({
    className = '',
    donutChartClass = '',
    donutLabelsClass = '',
    id,
    type = DONUT_CHART_TYPES.HORIZONTAL,
    items: itemsProp,
    title,
    subtitle,
    pageType,
    isChartLoading = false,
    convertData = false,
    computedTotal = 0,
    exportName = '',
    isShowTrend = true,
    ...props
}) => {
    const chartComponentRef = useRef(null);
    const centeredItemRef = useRef(null);
    const chartsContainer = useRef(null);

    const [items, setItems] = useState(itemsProp);

    useEffect(() => {
        setItems(itemsProp);
    }, [itemsProp]);

    useEffect(() => {
        centeredItemRef.current = document.querySelector('.customTitle');
    }, []);

    const labels = items.map(({ label }) => label);
    const colors = items.map(({ color }) => color);
    const series = items.map(({ value }) => Math.round(value));

    const totalValue = convertData ? computedTotal : series.reduce((acc, item) => acc + item, 0);
    const formattedTotalValue = totalValue.toLocaleString('en-US');

    useEffect(() => {
        renderCenteredItemContent(totalValue, items[0]?.unit);
    }, [totalValue]);

    const handleDropDownOptionClicked = async (name) => {
        switch (name) {
            case DOWNLOAD_TYPES.downloadSVG:
                try {
                    await downloadImage(chartsContainer.current, exportName, 'svg');
                } catch (error) {
                    console.log(error);
                }
                break;
            case DOWNLOAD_TYPES.downloadPNG:
                try {
                    await downloadImage(chartsContainer.current, exportName, 'png');
                } catch (error) {
                    console.log(error);
                }
                break;
            case DOWNLOAD_TYPES.downloadCSV:
                getDonutChartCSVExport(labels, series, pageType);
                break;
            default:
                break;
        }
    };

    const centeredItemContent = (value, unit) =>
        ReactDOMServer.renderToString(
            <Typography.Header size={Typography.Sizes.xs} className="gray-550">
                {value} {unit}
            </Typography.Header>
        );

    const renderCenteredItemContent = (value, unit) => {
        if (!centeredItemRef.current) {
            return;
        }

        centeredItemRef.current.innerHTML = centeredItemContent(formatConsumptionValue(value), unit);
    };

    const changeItemsState = (colorIndex, isHovered) => {
        setItems((prevState) => prevState.map((item, index) => (index === colorIndex ? { ...item, isHovered } : item)));
    };

    const hoverChart = (index) => {
        const data = chartComponentRef.current?.chart.series[0].data;
        const plot = data[index];

        plot.setState('hover');

        onHoverHandler(data, index);

        renderCenteredItemContent(series[index], items[index]?.unit);
    };

    const unHoverChart = (index) => {
        const data = chartComponentRef.current?.chart.series[0].data;
        const plot = data[index];

        plot.setState('normal');

        onUnHoverHandler(data, index);

        renderCenteredItemContent(totalValue, items[0]?.unit);
    };

    const renderChart = () => {
        return (
            <HighchartsReact
                highcharts={Highcharts}
                options={configDonutChartWidget({
                    changeItemsState,
                    totalValue: formattedTotalValue,
                    items,
                    renderCenteredItemContent,
                    centeredItemContent,
                    labels,
                    series,
                    colors,
                })}
                ref={chartComponentRef}
            />
        );
    };

    return (
        <>
            <div className={`donut-main-wrapper ${className}`} style={props.style}>
                <div className="d-flex justify-content-between">
                    <Titles {...{ title, subtitle, pageType }} />
                    <DropDownIcon
                        classNameButton="donut-chart-download-button mr-3 mt-3"
                        options={[
                            {
                                name: DOWNLOAD_TYPES.downloadSVG,
                                label: 'Download SVG',
                            },
                            {
                                name: DOWNLOAD_TYPES.downloadPNG,
                                label: 'Download PNG',
                            },
                            {
                                name: DOWNLOAD_TYPES.downloadCSV,
                                label: 'Download CSV',
                            },
                        ]}
                        label={''}
                        triggerButtonIcon={<BurgerIcon />}
                        handleClick={handleDropDownOptionClicked}
                    />
                </div>

                {isChartLoading ? (
                    <div className="donut-main-wrapper-loader">
                        <Spinner />
                    </div>
                ) : (
                    <div
                        ref={chartsContainer}
                        className={`donut-chart-widget-wrapper w-100 justify-content-center ${className} ${type}`}>
                        <div className={`chart-wrapper ${type}`}>{renderChart()}</div>

                        <div className="chart-labels">
                            <div className={`chart-labels ${donutLabelsClass}`}>
                                <DonutChartLabels
                                    onHover={(_, index) => hoverChart(index)}
                                    onMouseLeave={(_, index) => unHoverChart(index)}
                                    className={type}
                                    isShowTrend={isShowTrend}
                                    isShowValue
                                    labels={items}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {props.onMoreDetail && (
                    <div className="donut-chart-widget-more-detail">
                        <Button
                            label="More Details"
                            size={Button.Sizes.lg}
                            icon={<ArrowRight style={{ height: 11 }} />}
                            type={Button.Type.tertiary}
                            iconAlignment={Button.IconAlignment.right}
                            onClick={props.onMoreDetail}
                        />
                    </div>
                )}
            </div>
        </>
    );
};

DonutChartWidget.defaultProps = {
    onMoreDetail: () => {},
};

DonutChartWidget.propTypes = {
    id: PropTypes.string,
    type: PropTypes.oneOf(Object.values(DONUT_CHART_TYPES)),
    items: PropTypes.arrayOf(
        PropTypes.shape({
            label: PropTypes.string.isRequired,
            color: PropTypes.string.isRequired,
            value: PropTypes.any.isRequired,
            unit: PropTypes.string.isRequired,
            trendValue: PropTypes.number,
            link: PropTypes.string,
            onClick: PropTypes.func,
        }).isRequired
    ).isRequired,
    pageType: PropTypes.string,
    exportName: PropTypes.string,
};

export default DonutChartWidget;
