import React, { useState, useEffect } from 'react';
import { getBezierPath, getEdgeCenter } from 'react-flow-renderer';
import { BreakersStore } from '../../../store/BreakersStore';
import { BuildingStore } from '../../../store/BuildingStore';
import { LoadingStore } from '../../../store/LoadingStore';
import {
    setProcessing,
    breakerLinkingAlerts,
    unableLinkingAlerts,
    getEquipmentForBreaker,
    validateConfiguredEquip,
    validateDeviceForBreaker,
} from './utils';
import { ReactComponent as LinkSVG } from '../../../assets/icon/panels/link.svg';
import { ReactComponent as UnlinkSVG } from '../../../assets/icon/panels/unlink.svg';
import { updateBreakersLink } from './services';
import './panel-style.css';

const foreignObjectSize = 30;

export default function CustomEdge({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    markerEnd,
}) {
    const edgePath = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    });
    const [edgeCenterX, edgeCenterY] = getEdgeCenter({
        sourceX,
        sourceY,
        targetX,
        targetY,
    });

    const bldgId = BuildingStore.useState((s) => s.BldgId);

    const disconnectBreakerLinkData = BreakersStore.useState((s) => s.disconnectBreakerLinkData);
    const disconnectedBreakersData = BreakersStore.useState((s) => s.disconnectedBreakersData);
    const isEditable = BreakersStore.useState((s) => s.isEditable);
    const panelData = BreakersStore.useState((s) => s.panelData);

    const [breakerLinkObj, setBreakerLinkObj] = useState({});

    const [sourceBreakerObj, setSourceBreakerObj] = useState({});
    const [targetBreakerObj, setTargetBreakerObj] = useState({});

    const triggerBreakerAPI = () => {
        LoadingStore.update((s) => {
            s.isBreakerDataFetched = true;
        });
    };

    const getVoltageConfigValue = (value, breakerType) => {
        if (breakerType === 'single') {
            if (value === '208/120') {
                return 120;
            }
            if (value === '480') {
                return 277;
            }
            if (value === '600') {
                return 347;
            }
        }
        if (breakerType === 'double') {
            if (value === '208/120') {
                return 240;
            }
            if (value === '480') {
                return 480;
            }
        }
        if (breakerType === 'triple') {
            if (value === '208/120') {
                return 208;
            }
            if (value === '480') {
                return 480;
            }
            if (value === '600') {
                return 600;
            }
        }
    };

    const getPhaseConfigValue = (value, breakerType) => {
        if (breakerType === 'single') {
            if (value === '208/120') {
                return 1;
            }
            if (value === '480') {
                return 1;
            }
            if (value === '600') {
                return 1;
            }
        }
        if (breakerType === 'double') {
            if (value === '208/120') {
                return 1;
            }
            if (value === '480') {
                return 1;
            }
        }
        if (breakerType === 'triple') {
            if (value === '208/120') {
                return 3;
            }
            if (value === '480') {
                return 3;
            }
            if (value === '600') {
                return 3;
            }
        }
    };

    const isBothBreakerLinked = () => {
        let isLinked;
        // If Parent ID exist for Source Breaker
        if (sourceBreakerObj?.data?.parentBreaker !== '') {
            if (sourceBreakerObj?.data?.parentBreaker === targetBreakerObj?.data?.parentBreaker) {
                isLinked = true;
            } else {
                isLinked = false;
            }
        }
        // If Parent ID not exist for Source Breaker
        if (sourceBreakerObj?.data?.parentBreaker === '') {
            if (sourceBreakerObj?.id === targetBreakerObj?.data?.parentBreaker) {
                isLinked = true;
            } else {
                isLinked = false;
            }
        }
        return isLinked;
    };

    const linkMultipleBreakersAPI = async (breakerObjOne, breakerObjTwo) => {
        const params = `?building_id=${bldgId}`;
        const payload = [breakerObjOne, breakerObjTwo];
        await updateBreakersLink(params, payload)
            .then((res) => {
                triggerBreakerAPI();
            })
            .catch(() => {
                setProcessing(false);
            });
    };

    const linkTripleBreakersAPI = async (breakerObjOne, breakerObjTwo, breakerObjThree) => {
        const params = `?building_id=${bldgId}`;
        const payload = [breakerObjOne, breakerObjTwo, breakerObjThree];
        await updateBreakersLink(params, payload)
            .then((res) => {
                triggerBreakerAPI();
            })
            .catch(() => {
                setProcessing(false);
            });
    };

    const linkBreakers = () => {
        // breakerLink= 1:3 && breakerLink= 3:1 && breakerLink= 3:3
        if (sourceBreakerObj?.data?.breakerType === 3 || targetBreakerObj?.data?.breakerType === 3) {
            breakerLinkingAlerts(sourceBreakerObj?.data?.breaker_number, targetBreakerObj?.data?.breaker_number);
            return;
        }

        // breakerLink= 1:1
        if (sourceBreakerObj?.data?.breakerType === 1 && targetBreakerObj?.data?.breakerType === 1) {
            if (panelData?.voltage === '600') {
                if (targetBreakerObj?.data?.breaker_number + 1 === 3) {
                    let thirdBreakerObj = disconnectedBreakersData.find(
                        (record) => record?.data?.breaker_number === targetBreakerObj?.data?.breaker_number + 1
                    );

                    if (sourceBreakerObj?.data?.breakerType === 3) {
                        breakerLinkingAlerts(
                            sourceBreakerObj?.data?.breaker_number,
                            targetBreakerObj?.data?.breaker_number
                        );
                        return;
                    }

                    if (targetBreakerObj?.data?.breakerType === 3) {
                        breakerLinkingAlerts(
                            sourceBreakerObj?.data?.breaker_number,
                            targetBreakerObj?.data?.breaker_number
                        );
                        return;
                    }

                    if (thirdBreakerObj?.data?.breakerType === 3) {
                        breakerLinkingAlerts(
                            sourceBreakerObj?.data?.breaker_number,
                            targetBreakerObj?.data?.breaker_number
                        );
                        return;
                    }

                    const isLinkable = validateDeviceForBreaker([
                        sourceBreakerObj?.data?.device_id,
                        targetBreakerObj?.data?.device_id,
                        thirdBreakerObj?.data?.device_id,
                    ]);

                    if (!isLinkable) {
                        unableLinkingAlerts();
                        return;
                    }

                    let breakerOneEquip = sourceBreakerObj?.data?.equipment_link[0]
                        ? sourceBreakerObj?.data?.equipment_link[0]
                        : '';
                    let breakerTwoEquip = targetBreakerObj?.data?.equipment_link[0]
                        ? targetBreakerObj?.data?.equipment_link[0]
                        : '';
                    let breakerThreeEquip = thirdBreakerObj?.data?.equipment_link[0]
                        ? thirdBreakerObj?.data?.equipment_link[0]
                        : '';

                    let equipmentID = '';
                    let equipmentList = [breakerOneEquip, breakerTwoEquip, breakerThreeEquip];

                    if (!(breakerOneEquip === '' && breakerTwoEquip === '' && breakerThreeEquip === '')) {
                        let configuredEquip = equipmentList.filter((el) => el !== '');
                        if (configuredEquip.length === 1) {
                            equipmentID = configuredEquip[0];
                        } else {
                            unableLinkingAlerts();
                            return;
                        }
                    }

                    setProcessing(true);

                    let breakerObjOne = {
                        breaker_id: sourceBreakerObj.id,
                        voltage: getVoltageConfigValue(panelData?.voltage, 'triple'),
                        phase_configuration: getPhaseConfigValue(panelData?.voltage, 'triple'),
                        breaker_type: 3,
                        parent_breaker: '',
                        is_linked: true,
                        equipment_id: equipmentID,
                    };

                    let breakerObjTwo = {
                        breaker_id: targetBreakerObj.id,
                        voltage: getVoltageConfigValue(panelData?.voltage, 'triple'),
                        phase_configuration: getPhaseConfigValue(panelData?.voltage, 'triple'),
                        breaker_type: 3,
                        parent_breaker: sourceBreakerObj.id,
                        is_linked: true,
                        equipment_id: equipmentID,
                    };

                    let breakerObjThree = {
                        breaker_id: thirdBreakerObj.id,
                        voltage: getVoltageConfigValue(panelData?.voltage, 'triple'),
                        phase_configuration: getPhaseConfigValue(panelData?.voltage, 'triple'),
                        breaker_type: 3,
                        parent_breaker: sourceBreakerObj.id,
                        is_linked: true,
                        equipment_id: equipmentID,
                    };
                    linkTripleBreakersAPI(breakerObjOne, breakerObjTwo, breakerObjThree);
                    return;
                }

                if (targetBreakerObj?.data?.breaker_number + 1 === 4) {
                    let parentBreakerObj = disconnectedBreakersData.find(
                        (record) => record?.data?.breaker_number === 1
                    );

                    if (sourceBreakerObj?.data?.breakerType === 3) {
                        breakerLinkingAlerts(
                            sourceBreakerObj?.data?.breaker_number,
                            targetBreakerObj?.data?.breaker_number
                        );
                        return;
                    }

                    if (targetBreakerObj?.data?.breakerType === 3) {
                        breakerLinkingAlerts(
                            sourceBreakerObj?.data?.breaker_number,
                            targetBreakerObj?.data?.breaker_number
                        );
                        return;
                    }

                    if (parentBreakerObj?.data?.breakerType === 3) {
                        breakerLinkingAlerts(
                            sourceBreakerObj?.data?.breaker_number,
                            targetBreakerObj?.data?.breaker_number
                        );
                        return;
                    }

                    const isLinkable = validateDeviceForBreaker([
                        parentBreakerObj?.data?.device_id,
                        sourceBreakerObj?.data?.device_id,
                        targetBreakerObj?.data?.device_id,
                    ]);

                    if (!isLinkable) {
                        unableLinkingAlerts();
                        return;
                    }

                    let breakerOneEquip = parentBreakerObj?.data?.equipment_link[0]
                        ? parentBreakerObj?.data?.equipment_link[0]
                        : '';
                    let breakerTwoEquip = sourceBreakerObj?.data?.equipment_link[0]
                        ? sourceBreakerObj?.data?.equipment_link[0]
                        : '';
                    let breakerThreeEquip = targetBreakerObj?.data?.equipment_link[0]
                        ? targetBreakerObj?.data?.equipment_link[0]
                        : '';

                    let equipmentID = '';
                    let equipmentList = [breakerOneEquip, breakerTwoEquip, breakerThreeEquip];

                    if (!(breakerOneEquip === '' && breakerTwoEquip === '' && breakerThreeEquip === '')) {
                        let configuredEquip = equipmentList.filter((el) => el !== '');
                        if (configuredEquip.length === 1) {
                            equipmentID = configuredEquip[0];
                        } else {
                            unableLinkingAlerts();
                            return;
                        }
                    }

                    setProcessing(true);

                    let breakerObjOne = {
                        breaker_id: parentBreakerObj.id,
                        voltage: getVoltageConfigValue(panelData?.voltage, 'triple'),
                        phase_configuration: getPhaseConfigValue(panelData?.voltage, 'triple'),
                        breaker_type: 3,
                        parent_breaker: '',
                        is_linked: true,
                        equipment_id: equipmentID,
                    };

                    let breakerObjTwo = {
                        breaker_id: sourceBreakerObj.id,
                        voltage: getVoltageConfigValue(panelData?.voltage, 'triple'),
                        phase_configuration: getPhaseConfigValue(panelData?.voltage, 'triple'),
                        breaker_type: 3,
                        parent_breaker: parentBreakerObj.id,
                        is_linked: true,
                        equipment_id: equipmentID,
                    };

                    let breakerObjThree = {
                        breaker_id: targetBreakerObj.id,
                        voltage: getVoltageConfigValue(panelData?.voltage, 'triple'),
                        phase_configuration: getPhaseConfigValue(panelData?.voltage, 'triple'),
                        breaker_type: 3,
                        parent_breaker: parentBreakerObj.id,
                        is_linked: true,
                        equipment_id: equipmentID,
                    };
                    linkTripleBreakersAPI(breakerObjOne, breakerObjTwo, breakerObjThree);
                    return;
                }
            }

            const isLinkable = validateDeviceForBreaker([
                sourceBreakerObj?.data?.device_id,
                targetBreakerObj?.data?.device_id,
            ]);

            if (!isLinkable) {
                unableLinkingAlerts();
                return;
            }

            const isEquipDiff = validateConfiguredEquip(sourceBreakerObj, targetBreakerObj);

            if (isEquipDiff) {
                unableLinkingAlerts();
                return;
            }

            setProcessing(true);

            const equipmentID = getEquipmentForBreaker([sourceBreakerObj, targetBreakerObj]);

            let breakerObjOne = {
                breaker_id: sourceBreakerObj.id,
                voltage: getVoltageConfigValue(panelData?.voltage, 'double'),
                phase_configuration: getPhaseConfigValue(panelData?.voltage, 'double'),
                breaker_type: 2,
                parent_breaker: '',
                is_linked: true,
                equipment_id: equipmentID,
            };

            let breakerObjTwo = {
                breaker_id: targetBreakerObj.id,
                voltage: getVoltageConfigValue(panelData?.voltage, 'double'),
                phase_configuration: getPhaseConfigValue(panelData?.voltage, 'double'),
                breaker_type: 2,
                parent_breaker: sourceBreakerObj.id,
                is_linked: true,
                equipment_id: equipmentID,
            };
            linkMultipleBreakersAPI(breakerObjOne, breakerObjTwo);
            return;
        }

        // breakerLink= 2:2
        if (sourceBreakerObj?.data?.breakerType === 2 && targetBreakerObj?.data?.breakerType === 2) {
            breakerLinkingAlerts(sourceBreakerObj?.data?.breaker_number, targetBreakerObj?.data?.breaker_number);
            return;
        }

        // breakerLink= 1:2 && breakerLink= 2:1
        if (sourceBreakerObj?.data?.breakerType === 2 || targetBreakerObj?.data?.breakerType === 2) {
            if (panelData?.voltage === '120/240') {
                breakerLinkingAlerts(sourceBreakerObj?.data?.breaker_number, targetBreakerObj?.data?.breaker_number);
                return;
            }

            // breakerLink= 2:1
            if (sourceBreakerObj?.data?.breakerType === 2) {
                let parentBreakerObj = disconnectedBreakersData.find(
                    (record) => record?.id === sourceBreakerObj?.data?.parentBreaker
                );

                const isLinkable = validateDeviceForBreaker([
                    parentBreakerObj?.data?.device_id,
                    sourceBreakerObj?.data?.device_id,
                    targetBreakerObj?.data?.device_id,
                ]);

                if (!isLinkable) {
                    unableLinkingAlerts();
                    return;
                }

                const isEquipDiff = validateConfiguredEquip(parentBreakerObj, targetBreakerObj);

                if (isEquipDiff) {
                    unableLinkingAlerts();
                    return;
                }

                setProcessing(true);

                const equipmentID = getEquipmentForBreaker([parentBreakerObj, targetBreakerObj]);

                let breakerObjOne = {
                    breaker_id: parentBreakerObj.id,
                    voltage: getVoltageConfigValue(panelData?.voltage, 'triple'),
                    phase_configuration: getPhaseConfigValue(panelData?.voltage, 'triple'),
                    breaker_type: 3,
                    parent_breaker: '',
                    is_linked: true,
                    equipment_id: equipmentID,
                };

                let breakerObjTwo = {
                    breaker_id: sourceBreakerObj.id,
                    voltage: getVoltageConfigValue(panelData?.voltage, 'triple'),
                    phase_configuration: getPhaseConfigValue(panelData?.voltage, 'triple'),
                    breaker_type: 3,
                    parent_breaker: parentBreakerObj.id,
                    is_linked: true,
                    equipment_id: equipmentID,
                };

                let breakerObjThree = {
                    breaker_id: targetBreakerObj.id,
                    voltage: getVoltageConfigValue(panelData?.voltage, 'triple'),
                    phase_configuration: getPhaseConfigValue(panelData?.voltage, 'triple'),
                    breaker_type: 3,
                    parent_breaker: parentBreakerObj.id,
                    is_linked: true,
                    equipment_id: equipmentID,
                };
                linkTripleBreakersAPI(breakerObjOne, breakerObjTwo, breakerObjThree);
                return;
            }

            // breakerLink= 1:2
            if (targetBreakerObj?.data?.breakerType === 2) {
                let thirdBreakerObj = disconnectedBreakersData.find(
                    (record) => record?.data.parentBreaker === targetBreakerObj?.id
                );

                const isLinkable = validateDeviceForBreaker([
                    sourceBreakerObj?.data?.device_id,
                    targetBreakerObj?.data?.device_id,
                    thirdBreakerObj?.data?.device_id,
                ]);

                if (!isLinkable) {
                    unableLinkingAlerts();
                    return;
                }

                const isEquipDiff = validateConfiguredEquip(sourceBreakerObj, targetBreakerObj);

                if (isEquipDiff) {
                    unableLinkingAlerts();
                    return;
                }

                setProcessing(true);

                const equipmentID = getEquipmentForBreaker([sourceBreakerObj, targetBreakerObj]);

                let breakerObjOne = {
                    breaker_id: sourceBreakerObj.id,
                    voltage: getVoltageConfigValue(panelData?.voltage, 'triple'),
                    phase_configuration: getPhaseConfigValue(panelData?.voltage, 'triple'),
                    breaker_type: 3,
                    parent_breaker: '',
                    is_linked: true,
                    equipment_id: equipmentID,
                };

                let breakerObjTwo = {
                    breaker_id: targetBreakerObj.id,
                    voltage: getVoltageConfigValue(panelData?.voltage, 'triple'),
                    phase_configuration: getPhaseConfigValue(panelData?.voltage, 'triple'),
                    breaker_type: 3,
                    parent_breaker: sourceBreakerObj.id,
                    is_linked: true,
                    equipment_id: equipmentID,
                };

                let breakerObjThree = {
                    breaker_id: thirdBreakerObj.id,
                    voltage: getVoltageConfigValue(panelData?.voltage, 'triple'),
                    phase_configuration: getPhaseConfigValue(panelData?.voltage, 'triple'),
                    breaker_type: 3,
                    parent_breaker: sourceBreakerObj.id,
                    is_linked: true,
                    equipment_id: equipmentID,
                };
                linkTripleBreakersAPI(breakerObjOne, breakerObjTwo, breakerObjThree);
                return;
            }
        }
    };

    const unlinkBreakers = () => {
        if (panelData?.voltage === '600') {
            // Parent Breaker in Triple Linking
            if (sourceBreakerObj?.data?.parentBreaker === '') {
                let linkedBreakerObjs = disconnectedBreakersData.filter(
                    (record) => record?.data?.parentBreaker === sourceBreakerObj?.id
                );
                let thirdBreakerObj = linkedBreakerObjs[1];

                let equipmentId =
                    sourceBreakerObj?.data?.equipment_link.length === 0
                        ? ''
                        : sourceBreakerObj?.data?.equipment_link[0];

                setProcessing(true);

                let breakerObjOne = {
                    breaker_id: sourceBreakerObj.id,
                    voltage: getVoltageConfigValue(panelData?.voltage, 'single'),
                    phase_configuration: getPhaseConfigValue(panelData?.voltage, 'single'),
                    breaker_type: 1,
                    parent_breaker: '',
                    is_linked: false,
                    equipment_id: equipmentId,
                };

                let breakerObjTwo = {
                    breaker_id: targetBreakerObj.id,
                    voltage: getVoltageConfigValue(panelData?.voltage, 'single'),
                    phase_configuration: getPhaseConfigValue(panelData?.voltage, 'single'),
                    breaker_type: 1,
                    parent_breaker: '',
                    is_linked: false,
                    equipment_id: '',
                };

                let breakerObjThree = {
                    breaker_id: thirdBreakerObj.id,
                    voltage: getVoltageConfigValue(panelData?.voltage, 'single'),
                    phase_configuration: getPhaseConfigValue(panelData?.voltage, 'single'),
                    breaker_type: 1,
                    parent_breaker: '',
                    is_linked: false,
                    equipment_id: '',
                };
                linkTripleBreakersAPI(breakerObjOne, breakerObjTwo, breakerObjThree);
                return;
            }
            // Child Breaker in Triple Linking
            if (sourceBreakerObj?.data?.parentBreaker !== '') {
                if (sourceBreakerObj?.data?.parentBreaker !== targetBreakerObj?.data?.parentBreaker) {
                    return;
                }
                let parentBreakerObj = disconnectedBreakersData.find(
                    (record) => record?.id === sourceBreakerObj?.data?.parentBreaker
                );

                let equipmentId =
                    parentBreakerObj?.data?.equipment_link.length === 0
                        ? ''
                        : parentBreakerObj?.data?.equipment_link[0];

                setProcessing(true);

                let breakerObjOne = {
                    breaker_id: parentBreakerObj.id,
                    voltage: getVoltageConfigValue(panelData?.voltage, 'single'),
                    phase_configuration: getPhaseConfigValue(panelData?.voltage, 'single'),
                    breaker_type: 1,
                    parent_breaker: '',
                    is_linked: false,
                    equipment_id: equipmentId,
                };

                let breakerObjTwo = {
                    breaker_id: sourceBreakerObj.id,
                    voltage: getVoltageConfigValue(panelData?.voltage, 'single'),
                    phase_configuration: getPhaseConfigValue(panelData?.voltage, 'single'),
                    breaker_type: 1,
                    parent_breaker: '',
                    is_linked: false,
                    equipment_id: '',
                };

                let breakerObjThree = {
                    breaker_id: targetBreakerObj.id,
                    voltage: getVoltageConfigValue(panelData?.voltage, 'single'),
                    phase_configuration: getPhaseConfigValue(panelData?.voltage, 'single'),
                    breaker_type: 1,
                    parent_breaker: '',
                    is_linked: false,
                    equipment_id: '',
                };
                linkTripleBreakersAPI(breakerObjOne, breakerObjTwo, breakerObjThree);
                return;
            }
        }
        if (sourceBreakerObj?.data?.breakerType === 3 && targetBreakerObj?.data?.breakerType === 3) {
            // Parent Breaker in Triple Linking
            if (sourceBreakerObj?.data?.parentBreaker === '') {
                let linkedBreakerObjs = disconnectedBreakersData.filter(
                    (record) => record?.data?.parentBreaker === sourceBreakerObj?.id
                );
                let thirdBreakerObj = linkedBreakerObjs[1];

                let equipmentId =
                    sourceBreakerObj?.data?.equipment_link.length === 0
                        ? ''
                        : sourceBreakerObj?.data?.equipment_link[0];

                setProcessing(true);

                let breakerObjOne = {
                    breaker_id: sourceBreakerObj.id,
                    voltage: getVoltageConfigValue(panelData?.voltage, 'single'),
                    phase_configuration: getPhaseConfigValue(panelData?.voltage, 'single'),
                    breaker_type: 1,
                    parent_breaker: '',
                    is_linked: false,
                    equipment_id: '',
                };

                let breakerObjTwo = {
                    breaker_id: targetBreakerObj.id,
                    voltage: getVoltageConfigValue(panelData?.voltage, 'double'),
                    phase_configuration: getPhaseConfigValue(panelData?.voltage, 'double'),
                    breaker_type: 2,
                    parent_breaker: '',
                    is_linked: true,
                    equipment_id: equipmentId,
                };

                let breakerObjThree = {
                    breaker_id: thirdBreakerObj.id,
                    voltage: getVoltageConfigValue(panelData?.voltage, 'double'),
                    phase_configuration: getPhaseConfigValue(panelData?.voltage, 'double'),
                    breaker_type: 2,
                    parent_breaker: targetBreakerObj.id,
                    is_linked: true,
                    equipment_id: equipmentId,
                };
                linkTripleBreakersAPI(breakerObjOne, breakerObjTwo, breakerObjThree);
                return;
            }
            // Child Breaker in Triple Linking
            if (sourceBreakerObj?.data?.parentBreaker !== '') {
                if (sourceBreakerObj?.data?.parentBreaker !== targetBreakerObj?.data?.parentBreaker) {
                    return;
                }
                let parentBreakerObj = disconnectedBreakersData.find(
                    (record) => record?.id === sourceBreakerObj?.data?.parentBreaker
                );

                let equipmentId =
                    parentBreakerObj?.data?.equipment_link.length === 0
                        ? ''
                        : parentBreakerObj?.data?.equipment_link[0];

                setProcessing(true);

                let breakerObjOne = {
                    breaker_id: parentBreakerObj.id,
                    voltage: getVoltageConfigValue(panelData?.voltage, 'double'),
                    phase_configuration: getPhaseConfigValue(panelData?.voltage, 'double'),
                    breaker_type: 2,
                    parent_breaker: '',
                    is_linked: true,
                    equipment_id: equipmentId,
                };

                let breakerObjTwo = {
                    breaker_id: sourceBreakerObj.id,
                    voltage: getVoltageConfigValue(panelData?.voltage, 'double'),
                    phase_configuration: getPhaseConfigValue(panelData?.voltage, 'double'),
                    breaker_type: 2,
                    parent_breaker: parentBreakerObj.id,
                    is_linked: true,
                    equipment_id: equipmentId,
                };

                let breakerObjThree = {
                    breaker_id: targetBreakerObj.id,
                    voltage: getVoltageConfigValue(panelData?.voltage, 'single'),
                    phase_configuration: getPhaseConfigValue(panelData?.voltage, 'single'),
                    breaker_type: 1,
                    parent_breaker: '',
                    is_linked: false,
                    equipment_id: '',
                };
                linkTripleBreakersAPI(breakerObjOne, breakerObjTwo, breakerObjThree);
                return;
            }
        }
        if (sourceBreakerObj?.data?.breakerType === 2 && targetBreakerObj?.data?.breakerType === 2) {
            let equipmentId =
                sourceBreakerObj?.data?.equipment_link.length === 0 ? '' : sourceBreakerObj?.data?.equipment_link[0];

            setProcessing(true);

            let breakerObjOne = {
                breaker_id: sourceBreakerObj.id,
                voltage: getVoltageConfigValue(panelData?.voltage, 'single'),
                phase_configuration: getPhaseConfigValue(panelData?.voltage, 'single'),
                breaker_type: 1,
                parent_breaker: '',
                is_linked: false,
                equipment_id: equipmentId,
            };
            let breakerObjTwo = {
                breaker_id: targetBreakerObj.id,
                voltage: getVoltageConfigValue(panelData?.voltage, 'single'),
                phase_configuration: getPhaseConfigValue(panelData?.voltage, 'single'),
                breaker_type: 1,
                parent_breaker: '',
                is_linked: false,
                equipment_id: '',
            };
            linkMultipleBreakersAPI(breakerObjOne, breakerObjTwo);
            return;
        }
    };

    useEffect(() => {
        let fetchedObj = disconnectBreakerLinkData.find((record) => record?.id === id);
        setBreakerLinkObj(fetchedObj);
    }, [disconnectBreakerLinkData]);

    useEffect(() => {
        let sourceObj = disconnectedBreakersData.find((record) => record?.id === breakerLinkObj?.source);
        let targetObj = disconnectedBreakersData.find((record) => record?.id === breakerLinkObj?.target);
        setSourceBreakerObj(sourceObj);
        setTargetBreakerObj(targetObj);
    }, [breakerLinkObj]);

    return (
        <>
            <path id={id} style={style} className="react-flow__edge-path" d={edgePath} markerEnd={markerEnd} />
            <foreignObject
                width={foreignObjectSize}
                height={foreignObjectSize}
                x={edgeCenterX - foreignObjectSize / 2}
                y={edgeCenterY - foreignObjectSize / 2}
                className=""
                requiredExtensions="http://www.w3.org/1999/xhtml">
                <body>
                    {/* When Source & Target Breaker not linked */}
                    {!sourceBreakerObj?.data?.isLinked && !targetBreakerObj?.data?.isLinked && (
                        <button
                            className="unlink_button_style"
                            onClick={() => {
                                if (!isEditable) {
                                    return;
                                }
                                linkBreakers();
                            }}>
                            <UnlinkSVG />
                        </button>
                    )}

                    {/* When Source Breaker is not linked & Target Breaker linked */}
                    {!sourceBreakerObj?.data?.isLinked && targetBreakerObj?.data?.isLinked && (
                        <button
                            className="unlink_button_style"
                            onClick={() => {
                                if (!isEditable) {
                                    return;
                                }
                                linkBreakers();
                            }}>
                            <UnlinkSVG />
                        </button>
                    )}

                    {/* When Source Breaker is linked & Target Breaker not linked */}
                    {sourceBreakerObj?.data?.isLinked && !targetBreakerObj?.data?.isLinked && (
                        <button
                            className="unlink_button_style"
                            onClick={() => {
                                if (!isEditable) {
                                    return;
                                }
                                linkBreakers();
                            }}>
                            <UnlinkSVG />
                        </button>
                    )}

                    {/* When Source & Target Breaker both linked */}
                    {sourceBreakerObj?.data?.isLinked && targetBreakerObj?.data?.isLinked && (
                        <>
                            {isBothBreakerLinked() && (
                                <button
                                    className="link_button_style"
                                    onClick={() => {
                                        if (!isEditable) {
                                            return;
                                        }
                                        unlinkBreakers();
                                    }}>
                                    <LinkSVG />
                                </button>
                            )}
                            {!isBothBreakerLinked() && (
                                <button
                                    className="unlink_button_style"
                                    onClick={() => {
                                        if (!isEditable) {
                                            return;
                                        }
                                        linkBreakers();
                                    }}>
                                    <UnlinkSVG />
                                </button>
                            )}
                        </>
                    )}
                </body>
            </foreignObject>
        </>
    );
}
