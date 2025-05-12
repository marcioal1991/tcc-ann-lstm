import * as tf from '@tensorflow/tfjs-node-gpu';
import { ObjectId } from "mongodb";
import "../common/load-env.js"
import {WINDOW_SIZE, FEATURES, ITEMS_PER_QUERY, MEASUREMENT_FEATURE} from "../common/constants.js";
import mongoManager from "../common/db.js";

const database = mongoManager.createDb('meteorological-data-normalized');
const collection = database.collection('data-normalized');
const TOTAL_ITEMS = await collection.find({
    city_id: new ObjectId('68213e9c9f989d9bf813504d')
}).count();

console.log(`Need to iterate through ${TOTAL_ITEMS}`);
const x = [];
const y = [];

let OFFSET = 0;
let CURRENT_TOTAL = 0;

// while(TOTAL_ITEMS > CURRENT_TOTAL) {
    const documents = await collection.find({
        city_id: new ObjectId('68213e9c9f989d9bf813504d')
    }).toArray();

    console.log('LOADED');
    CURRENT_TOTAL += documents.length;
    OFFSET += ITEMS_PER_QUERY;
    console.log(`Iterate through ${CURRENT_TOTAL} of ${TOTAL_ITEMS} items`);

    for (let i = 1; i < documents.length - WINDOW_SIZE; i++) {
        const window = [];

        // Get all 24 hours to create a shape for next precipitation hour
        for (let j = 0; j < WINDOW_SIZE; j++) {
            const current = documents[i + j];
            window.push(new Float64Array(FEATURES.map(feature => current[feature])));
        }

        const NEXT_HOUR_PRECIPITATION = i + WINDOW_SIZE;
        const target = documents[NEXT_HOUR_PRECIPITATION][MEASUREMENT_FEATURE];

        x.push(window);
        y.push(new Float64Array([target]));
    }
// }

process.exit();

const model = tf.sequential();









model.add(tf.layers.lstm({
    units: 64,
    inputShape: [
        WINDOW_SIZE,
        FEATURES.length,
    ]
}));

model.add(tf.layers.dense({
    units: 1,
    activation: 'sigmoid',
}));


model.compile({
    optimizer: tf.train.adam(),
    loss: "binaryCrossentropy",
    metrics: ["accuracy"],
});



await model.fit(X, y, {
    epochs: 10,
    batchSize: 128,
    validationSplit: 0.2,
    callbacks: tf.callbacks.earlyStopping({ patience: 3 })
});
