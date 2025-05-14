
import '../common/load-env.js';
import mongoManager from '../common/db.js';
import WorkerManager from "../common/WorkerManager.js";
import path from "path";

const database = mongoManager.createDb('meteorological-data-normalized');
const collection = database.collection('cities');

const cities = await collection.distinct('_id', {
    station_code: {
        $in: [
            // 'B807', // PORTO ALEGRE - BELEM NOVO
            'A801', // PORTO ALEGRE - JARDIM BOTANICO
        ],
    }
});

const workerManager = new WorkerManager(path.join(import.meta.dirname, './train-worker.js'), Math.min(2, cities.length));

for (const cityId of cities) {
    const { worker, done } = workerManager.allocateWorker();
    const listener = (event) => {
        if (event.processFinished) {
            console.log('Finished', cityId)
            done();
            worker.off('message', listener);
            console.log(`Train for ${cityId} finished.`);
        }
    }

    worker.on('message', listener);
    worker.postMessage({
        cityId: cityId.toString(),
    });
}

while (workerManager.remainingRunningWorkers !== 0) {
    console.log('waiting for all remaining task worker...', workerManager.remainingRunningWorkers);
    await new Promise((resolve) => setTimeout(resolve, 1000));
}


console.log('All training models finished');

process.exit();


