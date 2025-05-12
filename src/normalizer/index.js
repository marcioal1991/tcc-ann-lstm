import path from "path";
import '../common/load-env.js'
import WorkerManager from "../common/WorkerManager.js";
import { availableThreads } from "../common/general.js";
import mongoManager from "../common/db.js";

const workerManager = new WorkerManager(path.join(import.meta.dirname, './worker.js'), availableThreads);
const database = mongoManager.createDb('meteorological-data');
const normalizedDatabase = mongoManager.createDb('meteorological-data-normalized');

['city_id', 'measurement_datetime'].forEach(async indexName => {
    console.log('creating city index');
    const index = await normalizedDatabase.collection('data').createIndex({ [indexName]: 1 });
    console.log('index created', index);
});

const citiesCollection = await database.collection('cities').find({}, { projection: { _id: 1 } }).toArray();
const cities = citiesCollection.map(item => item._id.toString());

while (cities.length > 0) {
    if (!workerManager.hasAvailableWorker) {
        console.log('wait for next available worker');
        await new Promise(resolve => setTimeout(resolve, 1000));
        continue;
    }
    const nextCity = cities.shift();
    const { worker, done } = workerManager.allocateWorker();
    const listener = (event) => {
        if (event.processFinished) {
            console.log('Finished', nextCity)
            done();
            worker.off('message', listener);
        }
    }

    worker.on('message', listener);
    worker.postMessage({
        cityId: nextCity,
    })
}


while (workerManager.remainingRunningWorkers !== 0) {
    console.log('waiting for all remaining task worker...', workerManager.remainingRunningWorkers);
    await new Promise((resolve) => setTimeout(resolve, 1000));
}

console.info('All tasks has been done.');
process.exit();
