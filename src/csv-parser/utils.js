import fs from "fs";
import readline from "readline";
import path from "path";

export async function createCSVWithoutCityInfos(sourceFile, destinationFilePath) {
    const stream = fs.createReadStream(sourceFile);
    const rl = readline.createInterface({
        input: stream,
        crlfDelay: Infinity,
    });

    const dirname = path.dirname(destinationFilePath);
    if (!fs.existsSync(dirname)){
        fs.mkdirSync(dirname, { recursive: true });
    }

    const output = fs.createWriteStream(destinationFilePath);

    let linecount = 0;
    const cityData = [];
    for await (const line of rl) {
        if (linecount >= 10) {
            output.write(line + '\n');
        } else {
            cityData.push(line);
        }
        linecount++;
    }

    output.close();

    return cityData;
}


export async function createCSVForCityInfos(infos, destinationFilePath) {
    const stream = fs.createWriteStream(destinationFilePath);
    const cityData = infos.reduce((acc, cur) => {
        if (cur !== '') {
            const parts = cur.split(':');
            const head = parts[0].trim();
            const value = parts[1].trim();
            acc.heading = acc.heading.concat(head).concat(';');
            acc.row = acc.row.concat(value).concat(';');
        }

        return acc;
    }, {
        heading: '',
        row: '',
    })

    stream.write(cityData.heading + '\n');
    stream.write(cityData.row + '\n');
    stream.close();
}
