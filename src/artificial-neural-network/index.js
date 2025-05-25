
import '../common/load-env.js';
import mongoManager from '../common/db.js';
import { trainWithoutWeights, trainWithWeights } from "./utils.js";

const database = mongoManager.createDb('meteorological-data-normalized');
const collection = database.collection('cities');

const cities = await collection.find({
    station_code: {
        $in: [
            'A801', // PORTO ALEGRE - JARDIM BOTANICO
        ],
    }
}, {
    _id: 1,
    name: 1,
}).toArray();

for (const city of cities) {
    await trainWithoutWeights({
        cityId: city._id.toString(),
        cityName: city.name,
    });

    await trainWithWeights({
        cityId: city._id.toString(),
        cityName: city.name,
    });
}
console.log('All training models finished');

process.exit();


