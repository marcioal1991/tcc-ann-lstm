import path from "path";
import '../common/load-env.js';
import mongoManager from "../common/db.js";
import WorkerManager from "../common/WorkerManager.js";
import { initializeMinMax } from "../common/general.js";

const database = mongoManager.createDb('meteorological-data-normalized');
const citiesCollection = await database.collection('cities').find({}, { projection: { _id: 1 } }).toArray();
const citiesIds = citiesCollection.map(item => item._id.toString());

const MIN_MAX = await (async function () {
    const MIN_MAX = initializeMinMax();

    console.log('Calculating MIN and MAX of the features');
    const cities = citiesIds.map(id => id.toString());
    const TOTAL_CITIES = cities.length;
    let TOTAL_CITIES_ANALYZED = 0;
    const workerManager = new WorkerManager(path.join(import.meta.dirname, './worker-min-max.js'), 6);

    while (TOTAL_CITIES >= TOTAL_CITIES_ANALYZED) {
        if (!workerManager.hasAvailableWorker) {
            console.log('wait for next available worker');
            await new Promise(resolve => setTimeout(resolve, 200));
            continue;
        }

        const nextCity = cities.shift();

        const { worker, done } = workerManager.allocateWorker();
        const listener = (event) => {
            if (event.processFinished) {
                console.log('Finished', nextCity)
                done();
                worker.off('message', listener);
                const THREAD_MIN_MAX = event.MIN_MAX;

                Object.entries(THREAD_MIN_MAX).forEach(([feature, MIN_MAX_VALUES]) => {
                    MIN_MAX[feature].MIN = MIN_MAX[feature].MIN === null ? MIN_MAX_VALUES.MIN : Math.min(MIN_MAX[feature].MIN, MIN_MAX_VALUES.MIN);
                    MIN_MAX[feature].MAX = MIN_MAX[feature].MAX === null ? MIN_MAX_VALUES.MAX : Math.max(MIN_MAX[feature].MAX, MIN_MAX_VALUES.MAX);
                });

                TOTAL_CITIES_ANALYZED++;
                console.log(`Analyzed ${TOTAL_CITIES_ANALYZED} of ${TOTAL_CITIES} cities`);
            }
        }

        worker.on('message', listener);
        worker.postMessage({
            cityId: nextCity,
        });
    }


    while (workerManager.remainingRunningWorkers !== 0) {
        console.log('waiting for all remaining task worker...', workerManager.remainingRunningWorkers);
        await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    await workerManager.destroy();
    await database.collection('feature_min_max_normalized').insertOne(MIN_MAX);

    return MIN_MAX
}());

console.log(MIN_MAX);

await (async function () {
    const database = mongoManager.createDb('meteorological-data-normalized');
    const dataNormalizedCollection = database.collection('data-normalized');

    for (const indexName of ['city_id', 'measurement_datetime']) {
        console.log('creating city index');
        const index = await dataNormalizedCollection.createIndex({ [indexName]: 1 });
        console.log('index created', index);
    };

    const cities = citiesIds.map(id => id);
    const workerManager = new WorkerManager(path.join(import.meta.dirname, './worker-normalize-data.js'), 6, {
        MIN_MAX,
    });


    while (cities.length > 0) {
        if (!workerManager.hasAvailableWorker) {
            console.log('wait for next available worker');
            await new Promise(resolve => setTimeout(resolve, 200));
            continue;
        }
        const nextCity = cities.shift();

        const { worker, done } = workerManager.allocateWorker();
        const listener = (event) => {
            if (event.processFinished) {
                console.log('Finished', nextCity)
                done();
                worker.off('message', listener);
                console.log(`Normalized ${citiesIds.length - cities.length} of ${citiesIds.length} cities`);
                return;
            }

            console.log('Fill with data');
        }

        worker.on('message', listener);
        worker.postMessage({
            cityId: nextCity,
        });
    }


    while (workerManager.remainingRunningWorkers !== 0) {
        console.log('waiting for all remaining task worker...', workerManager.remainingRunningWorkers);
        await new Promise((resolve) => setTimeout(resolve, 1000));
    }

}());

process.exit();
