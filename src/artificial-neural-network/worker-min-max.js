import { parentPort } from "worker_threads";
import mongoManager from "../common/db.js";
import { ObjectId } from "mongodb";
import { initializeMinMax } from "../common/general.js";
import { FEATURES } from "../common/constants.js";

const normalizedDatabase = mongoManager.createDb('meteorological-data-normalized');

parentPort.on('message', async ({ cityId }) => {
    const MIN_MAX = initializeMinMax();
    const dataDocuments = await normalizedDatabase.collection('data').find({ city_id: new ObjectId(cityId) })
        .sort({ _id: 1 })
        .toArray();

    for (const doc of dataDocuments) {
        FEATURES.forEach(([feature, value]) => {
            MIN_MAX[feature].MIN = MIN_MAX[feature].MIN === null ? value : Math.min(MIN_MAX[feature].MIN, value);
            MIN_MAX[feature].MAX = MIN_MAX[feature].MAX === null ? value : Math.max(MIN_MAX[feature].MAX, value);
        });
    }


    parentPort.postMessage({
        processFinished: true,
        MIN_MAX,
    })
})