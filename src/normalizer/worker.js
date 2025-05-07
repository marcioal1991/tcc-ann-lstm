import { parentPort } from "worker_threads";
import { ObjectId } from "mongodb";
import mongoManager from "../common/db.js";
import { normalizeCity, normalizeData } from "./utils.js";

const importedDatabase = mongoManager.createDb('meteorological-data');
const [importedCityCollection, importedDataCollection] = [importedDatabase.collection('cities'), importedDatabase.collection('data')];

const normalizedDatabase = mongoManager.createDb('meteorological-data-normalized');
const [normalizedCityCollection, normalizedDataCollection] = [normalizedDatabase.collection('cities'), normalizedDatabase.collection('data')];

parentPort.on('message', async ({ cityId }) => {
    const city = await importedCityCollection.findOne({ _id: new ObjectId(cityId) });
    const normalizedCityData = normalizeCity(city);
    const insertedCity = await normalizedCityCollection.insertOne(normalizedCityData);
    const dataArray = await importedDataCollection.find({ city_id: city._id }).toArray();
    const normalizedData = [];

    while (dataArray.length > 0) {
        const data = dataArray.shift();

        try {
            normalizedData.push(normalizeData(data, insertedCity.insertedId));
        } catch (error) {
            console.log(data)
            throw error;
        }
    }

    await normalizedDataCollection.insertMany(normalizedData);

    parentPort.postMessage({
        processFinished: true,
        cityId
    });
})