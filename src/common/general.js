import { availableParallelism } from "node:os";
import { FEATURES } from "./constants.js";

export const availableThreads = Math.floor(availableParallelism() / 2);
export const initializeMinMax = () => FEATURES.reduce((acc, item) => {
    acc[item] = {
        MIN: null,
        MAX: null,
    };

    return acc;
}, {});

export const normalizeValues = (MIN, MAX, value) => (value - MIN) / (MAX - MIN);
export const denormalizeValues = (MIN, MAX, value) => value * (MAX - MIN) + MIN;