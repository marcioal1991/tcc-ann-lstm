import { availableParallelism } from "node:os";

export const availableThreads = Math.floor(availableParallelism() / 2);