import fs from 'fs';
import path from 'path';
import '../common/load-env.js'
import Worker from 'worker_threads';

const __dirname = import.meta.dirname;
const SOURCE_DIR = path.join(process.env.FOLDER_ORIGINAL_CSV);
const DIST_FOLDER_DIR = path.join(process.env.FOLDER_PREPARED_CSV);
const WORKER_FILEPATH = path.join(__dirname, 'worker.js')

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

