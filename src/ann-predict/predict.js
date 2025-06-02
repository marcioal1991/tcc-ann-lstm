import * as tf from '@tensorflow/tfjs-node-gpu';
import '../common/load-env.js';
import mongoManager from "../common/db.js";
import {
    FEATURES_FOR_SHAPE,
    HARD_WEIGHTS,
    SOFT_WEIGHTS,
    WINDOW_SIZE
} from "../common/constants.js";
import { denormalizeValues } from "../common/general.js";

const database = mongoManager.createDb('meteorological-data-normalized');
const dataNormalizedCollection = database.collection('data-normalized');


export const predictWithWeights = async (cityId, suffix, MIN, MAX) => {
    await predict(cityId, `${suffix}-with-weight`, MIN, MAX, HARD_WEIGHTS);
};

export const predictWithoutWeights = async (cityId, suffix, MIN, MAX) => {
    await predict(cityId, `${suffix}-without-weight`, MIN, MAX, SOFT_WEIGHTS);
}

const predict = async (cityId, name, MIN, MAX, weights) => {
    const model = await tf.loadLayersModel(`file://./models/model-${name}/model.json`);
    const data2024 = await dataNormalizedCollection.find({
        city_id: cityId,
        measurement_datetime: {
            $gte: new Date('2024-04-30T00:00:00Z'),
            $lte: new Date('2024-05-31T23:59:59Z')
        }
    }).sort({ measurement_datetime: 1 })
        .toArray();

    const inputs = [];

    for (let i = 0; i < data2024.length - WINDOW_SIZE; i++) {
        const window = [];

        for (let j = 0; j < WINDOW_SIZE; j++) {
            const doc = data2024[i + j];
            window.push(FEATURES_FOR_SHAPE.map(f => doc[f] * weights[f]));
        }

        inputs.push(window);
    }

    const xPredict = tf.tensor3d(inputs);
    const yPred = model.predict(xPredict);
    const predictions = await yPred.array();

    const writer = tf.node.summaryFileWriter(`./logs/predictions-${name}/`);
    const stepOffset = 0;
    for (let i = 0; i < predictions.length; i++) {
        const pred = denormalizeValues(MIN, MAX, predictions[i][0]);
        const actual = denormalizeValues(MIN, MAX, data2024[i + WINDOW_SIZE].total_precipitation_hourly);
        writer.scalar('prediction', pred, i + stepOffset);
        writer.scalar('actual', actual, i + stepOffset);
        console.log(`Step ${i}: Predicted=${pred.toFixed(4)}, Actual=${actual.toFixed(4)}`);
    }

    const predictedValues = predictions.map(p => p[0]);
    const actualValues = data2024.slice(WINDOW_SIZE).map(doc => doc.total_precipitation_hourly);
    const writerHistogram = tf.node.summaryFileWriter(`./logs/predictions-histograms-${name}`);
    const dateLabels = data2024.map(doc =>
        doc.measurement_datetime.toISOString().slice(0, 10)
    );

    const groupedPred = {};
    const groupedActual = {};

    for (let i = 0; i < dateLabels.length; i++) {
        const date = dateLabels[i];
        const pred = predictedValues[i];
        const actual = actualValues[i];

        if (!groupedPred[date]) {
            groupedPred[date] = [];
            groupedActual[date] = [];
        }

        groupedPred[date].push(denormalizeValues(MIN, MAX, pred));
        groupedActual[date].push(denormalizeValues(MIN, MAX, actual));
    }


    const sortedDates = Object.keys(groupedPred).sort();

    for (let step = 0; step < sortedDates.length; step++) {
        const date = sortedDates[step];
        const predTensor = tf.tensor1d(groupedPred[date]);
        const actualTensor = tf.tensor1d(groupedActual[date]);
        writerHistogram.histogram('daily_prediction', predTensor, step);
        writerHistogram.histogram('daily_actual', actualTensor, step);

        const predMean = predTensor.mean().arraySync();
        const actualMean = actualTensor.mean().arraySync();

        writerHistogram.scalar('daily_prediction_avg', predMean, step);
        writerHistogram.scalar('daily_actual_avg', actualMean, step);

        predTensor.dispose();
        actualTensor.dispose();
    }
};