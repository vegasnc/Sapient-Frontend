import { LoadingStore } from '../../../store/LoadingStore';

export const setProcessing = (value) => {
    LoadingStore.update((s) => {
        s.isLoading = value;
    });
};

export const breakerLinkingAlerts = (numberOne, numberTwo) => {
    alert(`Breaker ${numberOne} & Breaker ${numberTwo} cannot be linked!`);
};