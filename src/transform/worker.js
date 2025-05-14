import { parentPort } from "worker_threads";
import { ObjectId } from "mongodb";
import mongoManager from "../common/db.js";
import { normalizeCity, normalizeData } from "./utils.js";
import { ITEMS_PER_QUERY } from "../common/constants.js";

const importedDatabase = mongoManager.createDb('meteorological-data');
const [importedCityCollection, importedDataCollection] = [importedDatabase.collection('cities'), importedDatabase.collection('data')];

const normalizedDatabase = mongoManager.createDb('meteorological-data-normalized');
const [normalizedCityCollection, normalizedDataCollection] = [normalizedDatabase.collection('cities'), normalizedDatabase.collection('data')];

parentPort.on('message', async ({ cityId }) => {
    let OFFSET = 0;
    let CURRENT_TOTAL = 0;

    const city = await importedCityCollection.findOne({ _id: new ObjectId(cityId) });
    const normalizedCityData = normalizeCity(city);
    const insertedCity = await normalizedCityCollection.insertOne(normalizedCityData);
    const TOTAL_TO_INSERT = await importedDataCollection.countDocuments({ city_id: city._id });

    let IS_FIRST_ROW_ACCEPTED = false;
    do {
        const dataArray = await importedDataCollection.find({ city_id: city._id })
            .limit(ITEMS_PER_QUERY)
            .skip(OFFSET)
            .sort({ _id: 1 })
            .toArray();

        OFFSET += ITEMS_PER_QUERY;
        CURRENT_TOTAL += dataArray.length;

        const normalizedData = [];
        while (dataArray.length > 0) {
            const data = dataArray.shift();
            const normalized = normalizeData(data, insertedCity.insertedId);
            if (IS_FIRST_ROW_ACCEPTED === false) {
                const someIsNullable = Object.entries(normalizedData)
                    .filter(([key, value]) => ['city_id', 'measurement_datetime'].includes(key))
                    .some(([key, value]) => value === null || value === undefined);

                if (someIsNullable) {
                    continue;
                }

                IS_FIRST_ROW_ACCEPTED = true;
            }

            normalizedData.push(normalized);
        }

        await normalizedDataCollection.insertMany(normalizedData);
    } while (CURRENT_TOTAL !== TOTAL_TO_INSERT);

    console.log(CURRENT_TOTAL, OFFSET);

    parentPort.postMessage({
        processFinished: true,
        cityId
    });
})