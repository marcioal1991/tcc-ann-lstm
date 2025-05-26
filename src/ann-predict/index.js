import '../common/load-env.js';
import mongoManager from '../common/db.js';
import { predictWithoutWeights, predictWithWeights } from "./predict.js";
import dashify from "dashify";

const database = mongoManager.createDb('meteorological-data-normalized');
const [
    citiesCollection,
    minMaxCollection,
] = [
    database.collection('cities'),
    database.collection('feature_min_max_normalized'),
];

const city = await citiesCollection.findOne({
    station_code: {
        $in: [
            'A801', // PORTO ALEGRE - JARDIM BOTANICO
        ],
    }
}, {
    _id: 1,
    name: 1,
});

const suffix = dashify(city.name);
const MAX_MIN = await minMaxCollection.findOne({}, { sort: { _id: -1 }});
const { MIN, MAX } = MAX_MIN.total_precipitation_hourly;

await predictWithoutWeights(city._id, suffix, MIN, MAX);
await predictWithWeights(city._id, suffix, MIN, MAX);

process.exit()