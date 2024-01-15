import {
    defaultMetrics,
    metricForActiveDevice,
    metricForPassiveWithMultipleBreaker,
    metricForPassiveWithOneBreaker,
} from './constants';

export const renderEquipChartMetrics = (equipObj) => {
    const { device_type, breaker_link = [] } = equipObj || {};

    if (device_type === 'active') {
        return metricForActiveDevice;
    }

    if (device_type === '') {
        return metricForPassiveWithOneBreaker;
    }

    if (device_type === 'passive') {
        return (breaker_link?.length || 0) <= 1 ? metricForPassiveWithOneBreaker : metricForPassiveWithMultipleBreaker;
    }

    return defaultMetrics;
};

export const handleDataConversion = (value, metricType = 'energy') => {
    if (value === '') {
        return null;
    }

    const unitWithNoConversionReq = ['runtime', 'starts'];
    const unitToDivideBy100 = ['max_phase_imbalance_percent', 'min_phase_imbalance_percent'];

    switch (metricType) {
        case metricType in unitWithNoConversionReq:
            return value;
        case metricType in unitToDivideBy100:
            return value / 100;
        default:
            return value / 1000;
    }
};