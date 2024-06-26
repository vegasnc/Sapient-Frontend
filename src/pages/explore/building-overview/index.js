import React, { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { DownOutlined } from '@ant-design/icons';
import { Dropdown, Menu } from 'antd';

import Header from '../../../components/Header';
import Brick from '../../../sharedComponents/brick';
import { Button } from '../../../sharedComponents/button';
import Select from '../../../sharedComponents/form/select';
import Toggles from '../../../sharedComponents/toggles/Toggles';
import Typography from '../../../sharedComponents/typography';

import ExploreBySpace from './by-space';
import ExploreByEquipments from './by-equipments';

import { UserStore } from '../../../store/UserStore';
import { ExploreStore } from '../../../store/ExploreStore';

import { exploreBldgMetrics, exploreSpaceMetrics } from '../utils';
import { EXPLORE_FILTER_TYPE, exploreFiltersList } from '../constants';

import '../styles.scss';

const ExploreFilters = (props) => {
    const { selectedFilter, handleMenuItemClick } = props;

    const MENU = (
        <Menu selectable={true} defaultSelectedKeys={[selectedFilter]} onSelect={handleMenuItemClick}>
            {exploreFiltersList.map((item) => (
                <Menu.Item key={item?.value}>{item?.label}</Menu.Item>
            ))}
        </Menu>
    );

    const activeFilterObj = exploreFiltersList.find((el) => el?.value === selectedFilter);

    return (
        <Dropdown overlay={MENU} className="mouse-pointer">
            <a className="ant-dropdown-link">
                {activeFilterObj?.label} <DownOutlined className="ml-2" />
            </a>
        </Dropdown>
    );
};

const ExploreBuildingOverview = () => {
    const { bldgId, filterType = EXPLORE_FILTER_TYPE.NO_GROUPING } = useParams();
    const history = useHistory();

    const selectedFilter = ExploreStore.useState((s) => s.selectedFilter);

    const metrics = selectedFilter === EXPLORE_FILTER_TYPE.BY_SPACE ? exploreSpaceMetrics : exploreBldgMetrics;

    const [isInComparisonMode, setComparisonMode] = useState(false);
    const [selectedUnit, setSelectedUnit] = useState(metrics[0].unit);
    const [selectedConsumptionLabel, setSelectedConsumptionLabel] = useState(metrics[0]?.Consumption);
    const [selectedConsumption, setConsumption] = useState(metrics[0]?.value);

    const toggleComparision = () => {
        setComparisonMode(!isInComparisonMode);
        UserStore.update((s) => {
            s.showNotification = true;
            s.notificationMessage = isInComparisonMode ? 'Comparison Mode turned OFF' : 'Comparison Mode turned ON';
            s.notificationType = 'success';
        });
    };

    const handleMenuItemClick = ({ key }) => {
        history.push({
            pathname: `/explore/building/${bldgId}/${key}`,
        });
    };

    const handleUnitChange = (value) => {
        const obj = metrics.find((record) => record?.value === value);
        setSelectedUnit(obj?.unit);
    };

    const handleConsumptionChange = (value) => {
        const obj = metrics.find((record) => record?.value === value);
        setSelectedConsumptionLabel(obj?.Consumption);
    };

    useEffect(() => {
        if (filterType) {
            localStorage.setItem('selectedFilter', filterType);

            ExploreStore.update((s) => {
                s.selectedFilter = filterType;
            });
        }
    }, [filterType]);

    return (
        <React.Fragment>
            {/* Explore Page Header  */}
            <div className="d-flex justify-content-between align-items-center">
                <ExploreFilters selectedFilter={selectedFilter} handleMenuItemClick={handleMenuItemClick} />

                <div className="d-flex flex-column" style={{ gap: '0.75rem' }}>
                    <div className="d-flex align-items-center" style={{ gap: '0.75rem' }}>
                        <Button
                            size={Button.Sizes.lg}
                            type={isInComparisonMode ? Button.Type.secondary : Button.Type.secondaryGrey}>
                            <Toggles
                                size={Toggles.Sizes.sm}
                                isChecked={isInComparisonMode}
                                onChange={toggleComparision}
                            />
                            <Typography.Subheader size={Typography.Sizes.lg} onClick={toggleComparision}>
                                Compare
                            </Typography.Subheader>
                        </Button>

                        <Select
                            defaultValue={selectedConsumption}
                            options={metrics}
                            onChange={(e) => {
                                setConsumption(e.value);
                                handleUnitChange(e.value);
                                handleConsumptionChange(e.value);
                            }}
                        />

                        <Header title="" type="page" />
                    </div>
                </div>
            </div>

            <Brick sizeInRem={1} />

            {/* Explore Page Body based on filter selected  */}
            {selectedFilter === EXPLORE_FILTER_TYPE.NO_GROUPING && (
                <ExploreByEquipments
                    bldgId={bldgId}
                    selectedUnit={selectedUnit}
                    selectedConsumption={selectedConsumption}
                    selectedConsumptionLabel={selectedConsumptionLabel}
                    isInComparisonMode={isInComparisonMode}
                    setComparisonMode={setComparisonMode}
                />
            )}

            {selectedFilter === EXPLORE_FILTER_TYPE.BY_SPACE && (
                <ExploreBySpace
                    bldgId={bldgId}
                    selectedUnit={selectedUnit}
                    selectedConsumption={selectedConsumption}
                    selectedConsumptionLabel={selectedConsumptionLabel}
                    isInComparisonMode={isInComparisonMode}
                    setComparisonMode={setComparisonMode}
                />
            )}
        </React.Fragment>
    );
};

export default ExploreBuildingOverview;
