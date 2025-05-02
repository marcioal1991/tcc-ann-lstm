import { availableParallelism } from 'node:os';
import fs from "fs";
import Worker from "worker_threads";
import '../common/load-env.js'
import path from "path";

const CSV_FOLDER = process.env.FOLDER_PREPARED_CSV;
const availableCores = Math.floor(availableParallelism() / 2);

const availableWorkers = new Map();
let createWorkerCount = availableCores;
while (createWorkerCount--) {
    const worker = new Worker.Worker(path.join(import.meta.dirname, './worker.js'));

    worker.on('message',event => {
        if (event.processFinished) {
            availableWorkers.set(worker.threadId, worker);
        }
    });

    availableWorkers.set(worker.threadId, worker);
}

fs.readdir(CSV_FOLDER, async (err, directories) => {
    if (err) throw err;

    while (directories.length > 0) {
        const value = availableWorkers.entries().next().value;


        if (value === undefined) {
            console.log('wait for next available worker');
            await new Promise((resolve) => setTimeout(resolve, 1000));
            continue;
        }

        const threadId = value[0];
        const worker = value[1];
        availableWorkers.delete(threadId);
        const dir = directories.shift();

        const directoryPath = path.join(CSV_FOLDER, dir);
        worker.postMessage({
            cityDirectory: directoryPath,
        });
    }


    while (availableWorkers.size !== availableCores) {
        console.log('waiting for all remaining task worker...', availableCores - availableWorkers.size);
        await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    console.info('All tasks has been done.');
    process.exit()
});