import { parentPort,  } from "worker_threads";
import fs from "fs";
import path from "path";
import dashify from "dashify";
import { createCSVForCityInfos, createCSVWithoutCityInfos } from "./utils.js";

parentPort.on('message', ({ dirname, cityName, distFolder }) => {
    fs.readdir(dirname, async (err, files) => {
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
        parentPort.close();
    })
})
