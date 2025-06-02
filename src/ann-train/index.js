
import '../common/load-env.js';
import mongoManager from '../common/db.js';
import { trainWithoutWeights, trainWithWeights } from "./train.js";
import dashify from "dashify";
import { promises as fs } from "fs";
import path from "path";

const database = mongoManager.createDb('meteorological-data-normalized');
const collection = database.collection('cities');

const city = await collection.findOne({
    station_code: {
        $in: [
            'A801', // PORTO ALEGRE - JARDIM BOTANICO
        ],
    }
}, {
    _id: 1,
    name: 1,
});

const id = city._id;
const suffix = dashify(city.name.split(' ').filter((item) => !item.includes('-')).join(' '));

const logDir = path.resolve('./logs');
const modelDir = path.resolve('./models');
try {
    await fs.access(logDir);
    await fs.rmdir(logDir, { recursive: true });
    await fs.mkdir(logDir);
} catch (error) {
    await fs.mkdir(logDir);
}

try {
    await fs.access(modelDir);
    await fs.rmdir(modelDir, { recursive: true });
    await fs.mkdir(modelDir);
} catch (error) {
    await fs.mkdir(modelDir);
}

await trainWithoutWeights(id, suffix);
await trainWithWeights(id, suffix);

console.log('All training models finished');

process.exit();


