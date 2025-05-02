import { parentPort } from "worker_threads";
import fs from "fs";
import path from "path";
import { readCSV } from "./utils.js";
import mongoManager from './../common/db.js';

const database = mongoManager.createDb('meteorological-data');
const [cityCollection, dataCollection] = [database.collection('city'), database.collection('data')];

parentPort.on('message', ({ cityDirectory }) => {
    fs.readdir(cityDirectory, async (err, files) => {
        if (err) throw err;
        files.sort();

        const [cityCsv, dataCsv] = files.map(file => path.join(cityDirectory, file));

        const cityDocument = await readCSV(cityCsv, async (data, resolve) => {
            const cityData = data[0];

            const reducedInfo = Object.entries(cityData).reduce((acc, data) => {
                if (data[0] !== '') {
                    acc[data[0]] = data[1];
                }

                return acc;
            }, {})


            const doc = await cityCollection.insertOne(reducedInfo);
            resolve(doc);
        });

        const csvDocument = await readCSV(dataCsv, async (data, resolve) => {
            data.forEach((item) => {
                item.city_id = cityDocument.insertedId;
            })

            const dataDocuments = await dataCollection.insertMany(data);
            resolve(dataDocuments)
        });

        parentPort.postMessage({
            processFinished: true,
            csvDocument
        });
    })
})