import { Test } from "../../testClass";
import * as tf from '@tensorflow/tfjs';
import { TensorflowDataHandler } from "./data";
import { CustomCallbackArgs, Logs, math } from "@tensorflow/tfjs";
import * as ProgressBar from "progress";
import { Event } from "../../resultInterface";

const TRAIN_TEST_RATIO = 5 / 6;

function getModel() {
  const model = tf.sequential();
  
  const IMAGE_WIDTH = 28;
  const IMAGE_HEIGHT = 28;
  const IMAGE_CHANNELS = 1;  
  
  // In the first layer of our convolutional neural network we have 
  // to specify the input shape. Then we specify some parameters for 
  // the convolution operation that takes place in this layer.
  model.add(tf.layers.conv2d({
    inputShape: [IMAGE_WIDTH, IMAGE_HEIGHT, IMAGE_CHANNELS],
    kernelSize: 5,
    filters: 8,
    strides: 1,
    activation: 'relu',
    kernelInitializer: 'varianceScaling'
  }));

  // The MaxPooling layer acts as a sort of downsampling using max values
  // in a region instead of averaging.  
  model.add(tf.layers.maxPooling2d({poolSize: [2, 2], strides: [2, 2]}));
  
  // Repeat another conv2d + maxPooling stack. 
  // Note that we have more filters in the convolution.
  model.add(tf.layers.conv2d({
    kernelSize: 5,
    filters: 16,
    strides: 1,
    activation: 'relu',
    kernelInitializer: 'varianceScaling'
  }));
  model.add(tf.layers.maxPooling2d({poolSize: [2, 2], strides: [2, 2]}));
  
  // Now we flatten the output from the 2D filters into a 1D vector to prepare
  // it for input into our last layer. This is common practice when feeding
  // higher dimensional data to a final classification output layer.
  model.add(tf.layers.flatten());

  // Our last layer is a dense layer which has 10 output units, one for each
  // output class (i.e. 0, 1, 2, 3, 4, 5, 6, 7, 8, 9).
  const NUM_OUTPUT_CLASSES = 10;
  model.add(tf.layers.dense({
    units: NUM_OUTPUT_CLASSES,
    kernelInitializer: 'varianceScaling',
    activation: 'softmax'
  }));

  
  // Choose an optimizer, loss function and accuracy metric,
  // then compile and return the model
  const optimizer = tf.train.adam();
  model.compile({
    optimizer: optimizer,
    loss: 'categoricalCrossentropy',
    metrics: ['accuracy'],
  });

  return model;
};

let amount: number = 0;

async function train(model: tf.Sequential, data: TensorflowDataHandler, bar: ProgressBar, batchSize: number, epochs: number) {
  const TRAIN_DATA_SIZE = Math.floor(data.numTrainElements / epochs);
  const TEST_DATA_SIZE = Math.floor(data.numTestElements / epochs);

  const [trainXs, trainYs] = tf.tidy(() => {
    const d = data.nextTrainBatch(TRAIN_DATA_SIZE, data.imageSize);
    return [
      d.xs.reshape([TRAIN_DATA_SIZE, data.imageWidth, data.imageHeight, 1]),
      d.labels
    ];
  });

  const [testXs, testYs] = tf.tidy(() => {
    const d = data.nextTestBatch(TEST_DATA_SIZE, data.imageSize);
    return [
      d.xs.reshape([TEST_DATA_SIZE, data.imageWidth, data.imageHeight, 1]),
      d.labels
    ];
  });

  const events: Event[] = [];

  const callbacks: CustomCallbackArgs = {
    //onTrainBegin: (logs: Logs) => console.log("onTrainBegin", logs),
    onTrainEnd: (logs?: Logs) => {
      //console.log("onTrainEnd", logs)
      //bar.tick(logs.size)
    },
    //onEpochBegin: (epoch: number, logs?: Logs) => console.log("onEpochBegin", logs),
    //onEpochEnd: (epoch: number, logs?: Logs) => console.log("onEpochEnd", logs),
    //onBatchBegin: (batch: number, logs?: Logs) => console.log("onBatchBegin", logs),
    onBatchEnd: (batch: number, logs?: Logs) => {
      const event: Event = {
        event: "onBatchEnd",
        batch: logs.batch,
        accuracy: logs.acc,
        loss: logs.loss,
        size: logs.size,
        time: Date.now()
      };

      events.push(event);
      amount += logs.size;
      bar.tick(logs.size);
    },
    onYield: (epoch: number, batch: number, logs: Logs) => {
      //console.log("onYield", logs)
      //bar.tick(logs.size)
    }
  }

  await model.fit(trainXs, trainYs, {
    batchSize: batchSize,
    validationData: [testXs, testYs],
    epochs,
    shuffle: true,
    callbacks: [
      callbacks
    ]
  });

  return events;
};

let test = 0;

export const TensorflowTest = new Test("tensorflow", async (request) => {
  const {mnistData, ratio, batchSize, epochs} = request;

  const data = new TensorflowDataHandler();
  data.load(mnistData, ratio);

  const model = getModel();

  var bar = new ProgressBar(`Running test ${test.toString()} [:bar] :rate images/s :percent :etas`, { total: Math.floor(data.numTrainElements / epochs) * epochs });
  test += 1;

  const startTime = Date.now();
  
  const events = await train(model, data, bar, batchSize, epochs);


  const endTime = Date.now();

  const totalTime = endTime - startTime;

  events.forEach(event => {
    event.time -= startTime;
  });

  return {
    totalTime,
    events,
    request
  };
})