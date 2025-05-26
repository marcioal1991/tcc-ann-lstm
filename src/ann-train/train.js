import * as tf from '@tensorflow/tfjs-node-gpu';
import "../common/load-env.js"
import {
    WINDOW_SIZE,
    MEASUREMENT_FEATURE,
    SOFT_WEIGHTS,
    HARD_WEIGHTS,
    FEATURES_FOR_SHAPE
} from "../common/constants.js";
import mongoManager from "../common/db.js";

const formatMemoryUsage = (data) => Math.round(data / 1024 / 1024 * 100) / 100;

const database = mongoManager.createDb('meteorological-data-normalized');
const collection = database.collection('data-normalized');

export const trainWithoutWeights = async (cityId, suffix) => {
    await train(cityId, `${suffix}-without-weight`, SOFT_WEIGHTS);
}

export const trainWithWeights = async (cityId, suffix) => {
    await train(cityId, `${suffix}-with-weight`, HARD_WEIGHTS);
}


const train = async (cityId, name, weights) => {
    const TOTAL_ITEMS = await collection.countDocuments({
        city_id: cityId,
        measurement_datetime: {
            $lte: new Date('2020-01-01T00:00:00Z'),
        }
    });

    console.log(`Need to iterate through ${TOTAL_ITEMS}`);
    const x = [];
    const y = [];

    let OFFSET = 0;
    let CURRENT_TOTAL = 0;
    let documents = [];
    const ITEMS_PER_QUERY = 48*30;

    while(TOTAL_ITEMS > CURRENT_TOTAL) {
        const documentsCollection = await collection.find({
            city_id: cityId,
            measurement_datetime: {
                $lte: new Date('2020-01-01T00:00:00Z'),
            }
        })
            .limit(ITEMS_PER_QUERY)
            .skip(OFFSET)
            .sort({ measurement_datetime: 1 })
            .toArray();

        documents = documents.concat(documentsCollection);
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
                window.push(FEATURES_FOR_SHAPE.map(feature => current[feature] * weights[feature]));
            }

            x.push(window);
            y.push([target]);
        }

        const memoryUsage = formatMemoryUsage(process.memoryUsage().heapUsed);
        console.log(memoryUsage);

        documents = documents.splice((WINDOW_SIZE) * -1);
    }

    console.log('Create LSTM');
    const model = createLSTM();
    console.log('LSTM created');

    console.log('Starting training');
    await trainLSTM(model, x, y, name);
    console.log('Train ended');
}


const trainLSTM = async (model, x, y, suffix) => {

    const xData = tf.tensor3d(x);
    const yData = tf.tensor2d(y);
    const logDir = `/logs/training-${suffix}`;
    const tensorBoardCallback = tf.node.tensorBoard(logDir);

    await model.fit(xData, yData, {
        epochs: 8,
        batchSize: 128,
        validationSplit: 0.2,
        callbacks: [
            tf.callbacks.earlyStopping({ patience: 3 }),
            tensorBoardCallback
        ]
    });

    await model.save(`file://../models/model-${suffix}`);

    model.dispose();

};
const createLSTM = () => {
    const model = tf.sequential();

    model.add(tf.layers.lstm({
        units: 128,
        activation: 'relu',
        inputShape: [
            WINDOW_SIZE,
            FEATURES_FOR_SHAPE.length,
        ]
    }));

    model.add(tf.layers.dense({
        units: 1,
        activation: 'linear',
    }));


    model.compile({
        optimizer: tf.train.adam(),
        loss: 'meanSquaredError',
        metrics: ["mae"],
    });

    model.summary();

    return model;
}


