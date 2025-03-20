import { parentPort,  } from "worker_threads";
import fs from "fs";
import path from "path";
import dashify from "dashify";
import { createCSVForCityInfos, createCSVWithoutCityInfos } from "./utils.js";

parentPort.on('message', async ({ dirname, cityName, distFolder }) => {
    await fs.readdir(dirname, async (err, files) => {
        const filename = files.shift();
        const filePath = path.join(dirname, filename);
        const kebabCaseCityName = dashify(cityName);

        const preparedCSVFilePath = path.join(distFolder, `${kebabCaseCityName}`, '/data.csv');
        const preparedCityInfosFilePath = path.join(distFolder, `${kebabCaseCityName}`, '/city.csv');

        console.log('Creating CSV file:', cityName);
        const cityInfos = await createCSVWithoutCityInfos(filePath, preparedCSVFilePath);
        console.log('CSV file created:', cityName);
        console.log('Creating CSV for city infos:', cityName);
        await createCSVForCityInfos(cityInfos, preparedCityInfosFilePath);
        console.log('CSV for city infos created:', cityName);

        process.exit(0)
        //
        // const document = await db.collection('cities').insertOne(
        //     cityData.reduce((acc, cur) => {
        //         if (cur !== '') {

        //             acc[column] = value;
        //         }
        //
        //         return acc;
        //     }, {})
        // );

        // console.log('Creating new rows...');
        //
        // await new Promise((resolve) => {
        //     const data = [];
        //     fs.createReadStream(preparedCSVFilePath)
        //         .pipe(csvParser({
        //             separator: ';'
        //         }))
        //         .on('data', (row) => {
        //             // row['city_id'] = document.insertedId;
        //             row = Object.entries(row).reduce((acc, cur) => {
        //                 if (cur[0] !== '') {
        //                     acc[cur[0]] = cur[1];
        //                 }
        //
        //                 return acc;
        //             }, {})
        //             data.push(row);
        //         })
        //         .on('end', () => {
        //             // db.collection('data').insertMany(data);
        //             console.log('done', dirname);
        //             console.log('inserted: ', data.length);
        //             resolve(data);
        //         });
        // });

    })
})
