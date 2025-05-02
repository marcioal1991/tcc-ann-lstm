import fs from 'fs'
import csvParser from "csv-parser";

export const readCSV = async (filePath, callback) => {
    return await new Promise((resolve) => {
        const data = [];
        fs.createReadStream(filePath)
            .pipe(csvParser({
                separator: ';'
            }))
            .on('data', row => data.push(row))
            .on('end', () => callback(data, resolve));
    });
}