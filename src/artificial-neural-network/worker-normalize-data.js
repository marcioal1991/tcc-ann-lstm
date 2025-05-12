import { workerData, parentPort } from "worker_threads";
import mongoManager from "../common/db.js";
import { ObjectId } from "mongodb";
import { normalizeValues } from "../common/general.js";
import { FEATURES, ITEMS_PER_QUERY } from "../common/constants.js";

const { MIN_MAX } = workerData;
const database = mongoManager.createDb('meteorological-data-normalized');
const dataCollection = database.collection('data');
const dataNormalizedCollection = database.collection('data-normalized');

parentPort.on('message', async ({ cityId }) => {
    let OFFSET = 0;
    let CURRENT_TOTAL = 0;
    const TOTAL_TO_INSERT = await dataCollection.find({ city_id: new ObjectId(cityId) }).count();

    do {
        const dataDocuments = await dataCollection.find({ city_id: new ObjectId(cityId) })
            .limit(ITEMS_PER_QUERY)
            .skip(OFFSET)
            .sort({ _id: 1 })
            .toArray();

        OFFSET += ITEMS_PER_QUERY;
        CURRENT_TOTAL += dataDocuments.length;

        const normalizedData = dataDocuments.map((item) => {
            return Object.entries(item).reduce((acc, [key, value]) => {
                if (['city_id', 'measurement_datetime'].includes(key)) {
                    acc[key] = value;
                } else if (FEATURES.includes(key)) {
                    const [MAX, MIN] = [MIN_MAX[key].MAX, MIN_MAX[key].MIN]
                    acc[key] = normalizeValues(MIN, MAX, value);
                }

                return acc;

            }, {});
        })

        await dataNormalizedCollection.insertMany(normalizedData);
    } while (CURRENT_TOTAL !== TOTAL_TO_INSERT);

    parentPort.postMessage({
        processFinished: true,
    })
});