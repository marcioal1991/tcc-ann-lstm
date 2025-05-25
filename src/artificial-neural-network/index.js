
import '../common/load-env.js';
import mongoManager from '../common/db.js';
import { train } from "./train.js";

const database = mongoManager.createDb('meteorological-data-normalized');
const collection = database.collection('cities');

const cities = await collection.find({
    station_code: {
        $in: [
            // 'B807', // PORTO ALEGRE - BELEM NOVO
            'A801', // PORTO ALEGRE - JARDIM BOTANICO
            // 'A803', // SANTA MARIA
        ],
    }
}, {
    _id: 1,
    name: 1,
}).toArray();

for (const city of cities) {
    await train({
        cityId: city._id.toString(),
        cityName: city.name,
    });
}
console.log('All training models finished');

process.exit();


