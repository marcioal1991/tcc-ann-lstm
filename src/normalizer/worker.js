import { parentPort } from "worker_threads";
import { ObjectId } from "mongodb";
import mongoManager from "../common/db.js";

const database = mongoManager.createDb('meteorological-data');
const [cityCollection, dataCollection] = [database.collection('city'), database.collection('data')];

parentPort.on('message', async ({ cityId }) => {
    const city = await cityCollection.findOne({ _id: new ObjectId(cityId) });
    const data = await dataCollection.find({ city_id: city._id }).toArray();

    parentPort.postMessage({
        processFinished: true,
        cityId
    });
})