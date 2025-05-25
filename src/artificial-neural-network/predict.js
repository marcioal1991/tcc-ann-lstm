import * as tf from '@tensorflow/tfjs-node-gpu';
import '../common/load-env.js';
import mongoManager from "../common/db.js";
import { FEATURES, WINDOW_SIZE } from "../common/constants.js";
import { denormalizeValues } from "../common/general.js";

const database = mongoManager.createDb('meteorological-data-normalized');
const [
    citiesCollection,
    dataNormalizedCollection,
    minMaxCollection,
    ] = [
        database.collection('cities'),
        database.collection('data-normalized'),
        database.collection('feature_min_max_normalized'),
    ];

const cities = await citiesCollection.find({
    station_code: {
        $in: [
            'A801', // PORTO ALEGRE - JARDIM BOTANICO
        ],
    }
}, {
    _id: 1,
    name: 1,
}).toArray();

for (const city of cities) {
    const cityId = city._id;
    const cityName = city.name;
    const model = await tf.loadLayersModel(`file://../models/model-${cityName}/model.json`);

    const MAX_MIN = await minMaxCollection.findOne({}, { sort: { _id: -1 }});
    const { MIN, MAX } = MAX_MIN.total_precipitation_hourly;

    const data2024 = await dataNormalizedCollection.find({
        city_id: cityId,
        measurement_datetime: {
            $gte: new Date('2024-04-30T00:00:00Z'),
            $lte: new Date('2024-05-07T23:59:59Z')
        }
    }).sort({ measurement_datetime: 1 })
        .toArray();

    const inputs = [];

    for (let i = 0; i < data2024.length - WINDOW_SIZE; i++) {
        const window = [];

        for (let j = 0; j < WINDOW_SIZE; j++) {
            const doc = data2024[i + j];
            window.push(FEATURES.map(f => doc[f]));
        }

        inputs.push(window);
    }

    console.log(inputs);

    const xPredict = tf.tensor3d(inputs);
    const yPred = model.predict(xPredict);
    const predictions = await yPred.array();

    const writer = tf.node.summaryFileWriter(`/logs/predictions/${cityName}`);
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
    const writerHistogram = tf.node.summaryFileWriter('/logs/predictions-histograms');
    const dateLabels = data2024.map(doc =>
        doc.measurement_datetime.toISOString().slice(0, 10)
    );

    const groupedPred = {};
    const groupedActual = {};

console.log(dateLabels.length);
process.exit()
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
        console.log(date, groupedPred[date], groupedActual[date]);
        const predTensor = tf.tensor1d(groupedPred[date]);
        const actualTensor = tf.tensor1d(groupedActual[date]);

        writerHistogram.histogram('daily_prediction', predTensor, step);
        writerHistogram.histogram('daily_actual', actualTensor, step);

        predTensor.dispose();
        actualTensor.dispose();
    }

    process.exit()
}

