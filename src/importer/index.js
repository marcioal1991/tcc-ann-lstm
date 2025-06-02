import fs from "fs";
import path from "path";
import '../common/load-env.js'
import WorkerManager from "../common/WorkerManager.js";
import { availableThreads } from "../common/general.js";
import mongoManager from "../common/db.js";

const database = mongoManager.createDb('meteorological-data');

console.log('creating index');
const index = await database.collection('data').createIndex({ city_id: 1 });
console.log('index created', index);

const CSV_FOLDER = process.env.FOLDER_PREPARED_CSV;
const workerManager = new WorkerManager(path.join(import.meta.dirname, './worker.js'), availableThreads);

fs.readdir(CSV_FOLDER, async (err, directories) => {
    if (err) throw err;
    const TOTAL_DIRECTORIES = directories.length;
    let TOTAL_DIRECTORIES_PROCESSED = 0;

    while (directories.length > 0) {
        if (!workerManager.hasAvailableWorker) {
            console.log('wait for next available worker');
            await new Promise((resolve) => setTimeout(resolve, 1000));
            continue;
        }

        const { worker, done } = workerManager.allocateWorker();
        const dir = directories.shift();
        const directoryPath = path.join(CSV_FOLDER, dir);
        const listener = (event) => {
            if (event.processFinished) {
                console.log(`Worker task done`)
                done();
                console.log('Removing listener from worker');
                TOTAL_DIRECTORIES_PROCESSED++;
                console.log(`Processed ${TOTAL_DIRECTORIES_PROCESSED} of ${TOTAL_DIRECTORIES} directories.`);
                worker.off('message', listener);
            }
        };

        console.log('Adding listener to worker');
        worker.on('message', listener);

        console.log('Sending directory to worker');
        worker.postMessage({
            cityDirectory: directoryPath,
        });
    }

    while (workerManager.remainingRunningWorkers !== 0) {
        console.log('waiting for all remaining task worker...', workerManager.remainingRunningWorkers);
        await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    console.info('All tasks has been done.');
    process.exit()
});