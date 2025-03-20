import fs from 'fs';
import path from 'path';
import Worker from 'worker_threads';
// import { MongoClient } from 'mongodb'


const __dirname = path.resolve();
const SOURCE_DIR = path.join(__dirname, '../resources/original');
const DIST_FOLDER_DIR = path.join(__dirname, '../resources/prepared-csv');
const WORKER_FILEPATH = path.join(__dirname, 'csv-parser/worker.js')

// const client = new MongoClient('mongodb://marcio:123456789@mongodb:27017');
// await client.connect();
// console.log(SOURCE_DIR, DIST_FOLDER_DIR, WORKER_FILEPATH)
// const db = client.db('meteorological-data');

fs.readdir(SOURCE_DIR, (err, directories) => {
    const workers = [];

    directories.forEach(async (dirname) => {
        const dir = path.join(SOURCE_DIR, dirname);

        const worker = new Worker.Worker(WORKER_FILEPATH);
        workers.push(worker);

        worker.on('exit', () => {
            console.log(`worker ${dirname} terminated`);
            workers.splice(workers.indexOf(worker), 1);

            if (workers.length === 0) {
                console.log('All workers were terminated');
                process.exit(0);
            } else {
                console.log(`Also remaining ${workers.length} workers`);
            }
        });

        worker.postMessage({
            dirname: dir,
            cityName: dirname,
            distFolder: DIST_FOLDER_DIR,
        });
    });
});

