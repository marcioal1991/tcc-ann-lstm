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
        FEATURES.forEach((feature) => {
            try {
                MIN_MAX[feature].MIN = MIN_MAX[feature].MIN === null ? doc[feature] : Math.min(MIN_MAX[feature].MIN, doc[feature]);
                MIN_MAX[feature].MAX = MIN_MAX[feature].MAX === null ? doc[feature] : Math.max(MIN_MAX[feature].MAX, doc[feature]);
            } catch (e) {
                console.log(feature)
                throw e;
            }

        });
    }


    parentPort.postMessage({
        processFinished: true,
        MIN_MAX,
    })
})