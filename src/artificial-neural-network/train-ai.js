import * as tf from '@tensorflow/tfjs-node-gpu';

import { ObjectId } from "mongodb";
import "../common/load-env.js"
import { WINDOW_SIZE, FEATURES, MEASUREMENT_FEATURE } from "../common/constants.js";
import mongoManager from "../common/db.js";

const formatMemoryUsage = (data) => Math.round(data / 1024 / 1024 * 100) / 100;
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
let documents = [];
const ITEMS_PER_QUERY = 48*30;

while(TOTAL_ITEMS > CURRENT_TOTAL) {
    const documentsCollection = await collection.find({
        city_id: new ObjectId('68213e9c9f989d9bf813504d')
    })
        .limit(ITEMS_PER_QUERY)
        .skip(OFFSET)
        .sort({ measurement_datetime: 1 })
        .toArray();

    documents = documents.concat(documentsCollection);
    // console.log(documents.map((doc) => doc.measurement_datetime));
    // await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log('LOADED');
    CURRENT_TOTAL += ITEMS_PER_QUERY;
    OFFSET += ITEMS_PER_QUERY;
    console.log(`Iterate through ${CURRENT_TOTAL} of ${TOTAL_ITEMS} items`);

    for (let i = 1; i < documents.length - WINDOW_SIZE; i++) {
        const window = [];
        const NEXT_HOUR_PRECIPITATION = i + WINDOW_SIZE;
        const target = documents[NEXT_HOUR_PRECIPITATION][MEASUREMENT_FEATURE];

        // Get all 24 hours to create a shape for next precipitation hour
        for (let j = 0; j < WINDOW_SIZE; j++) {
            const current = documents[i + j];
            window.push(FEATURES.map(feature => current[feature]));
        }

        x.push(window);
        y.push([target]);
    }

    const memoryUsage = formatMemoryUsage(process.memoryUsage().heapUsed);
    console.log(memoryUsage)
    if (memoryUsage > 1500) {
        global.gc();

    }

    documents = documents.splice((WINDOW_SIZE) * -1);
}


const xData = tf.tensor3d(x);
const yData = tf.tensor2d(y);
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

console.log('train model')

await model.fit(xData, yData, {
    epochs: 10,
    batchSize: 128,
    validationSplit: 0.2,
    callbacks: tf.callbacks.earlyStopping({ patience: 3 })
});
