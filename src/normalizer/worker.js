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
    const TOTAL_TO_INSERT = await importedDataCollection.find({ city_id: city._id }).count();
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
            normalizedData.push(normalizeData(data, insertedCity.insertedId));
        }

        await normalizedDataCollection.insertMany(normalizedData);
    } while (CURRENT_TOTAL !== TOTAL_TO_INSERT);

    console.log(CURRENT_TOTAL, OFFSET);

    parentPort.postMessage({
        processFinished: true,
        cityId
    });
})