
import '../common/load-env.js';
import mongoManager from '../common/db.js';
import { trainWithoutWeights, trainWithWeights } from "./train.js";
import dashify from "dashify";

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
const suffix = dashify(city.name);
await trainWithoutWeights(id, suffix);
await trainWithWeights(id, suffix);

console.log('All training models finished');

process.exit();


