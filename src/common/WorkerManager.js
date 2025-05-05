import { Worker } from 'worker_threads'
import fs from "fs";

export default class WorkerManager {
    size = 0;
    workerScript = null;
    workers = new Set();
    availableWorkers = new Set();

    constructor(workerScript, size) {
        this.size = size;
        this.workerScript = workerScript;
        if (!fs.existsSync(this.workerScript)) {
            throw new Error(`Worker script not found: ${this.workerScript}`);
        }

        this.createWorkers();
    }

    createWorkers() {
        for (let i = 0; i < this.size; i++) {
            const worker = new Worker(this.workerScript);
            this.workers.add(worker);
            this.availableWorkers.add(worker);
        }
    }

    allocateWorker() {
        if (!this.hasAvailableWorker) {
            return null;
        }

        const worker = this.availableWorkers.values().next().value;
        this.availableWorkers.delete(worker);

        return {
            worker,
            done: () => {
                this.availableWorkers.add(worker);
            },
        };
    }

    get hasAvailableWorker() {
        return this.availableWorkers.size > 0;
    }

    get remainingRunningWorkers() {
        return this.workers.size - this.availableWorkers.size;
    }

    getWorkers() {
        return this.workers;
    }
}