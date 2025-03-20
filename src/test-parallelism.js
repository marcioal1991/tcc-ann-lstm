import cluster from 'node:cluster';
import { availableParallelism } from 'node:os';
import process from 'node:process';
const numCPUs = availableParallelism();

const allCounters = [];

if (cluster.isPrimary) {
    console.log(`Primary ${process.pid} is running`);
    let counter = 0;
    // Fork workers.
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on('fork', (worker) => {
        console.log(`worker ${worker.process.pid} is dead: ${worker.isDead()}`);
        setTimeout(() => { worker.send(counter);}, 1200)

        worker.on('message', async (message) => {
            counter++;
            allCounters.push(counter);
            worker.send(counter);

            if (counter === 1000000) {
                console.log(allCounters.length);
                await new Promise(resolve => setTimeout(resolve, 1000));
                process.exit(0)
                return;
            }
        })
    });

    cluster.on('exit', (worker, code, signal) => {
        console.log(`worker ${worker.process.pid} is dead: ${worker.isDead()}`);
    });
} else {
    process.on('message', async (sentCounter) => {
        let counter = 0;
        if (sentCounter >= 1000000) {
            process.kill(process.pid);
            return;
        }

        for (let i = 0; i < 100000; i++) {
            counter++;
        }

        process.send({
            process: process.pid,
            counter: sentCounter + 1,
        });
    })
}