import * as tf from '@tensorflow/tfjs-node-gpu';

// console.log(await tf.engine().backend.memory());
const summaryWriter = tf.node.summaryFileWriter('./logs');

const model = tf.sequential();
model.add(tf.layers.lstm({
    units: 50,
    inputShape: [10, 1]
}));

model.add(tf.layers.dense({ units: 1 }));
model.compile({
    optimizer: 'adam',
    loss: 'meanSquaredError'
});

const xs = tf.randomNormal([100, 10, 1]);
const ys = tf.randomNormal([100, 1]);

const a = await model.fit(xs, ys, {
    epochs: 20000,
    batchSize: 512,
    callbacks: {
        onEpochEnd: async (epoch, logs) => {
            summaryWriter.scalar('loss', logs.loss, epoch)
            // summaryWriter.scalar('acc', logs.acc, epoch)
        }
    }
})

console.log(a);