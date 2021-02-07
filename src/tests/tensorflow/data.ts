import * as fs from "fs";
import {PNG} from 'pngjs';
import * as ProgressBar from "progress";
import * as tf from "@tensorflow/tfjs";
import { MnistData } from "../../data";

const NUM_CLASSES = 10;
const NUM_DATASET_ELEMENTS = 65000;

export class TensorflowDataHandler {
  public datasetLength: number;

  public imageSize: number;
  public imageWidth: number;
  public imageHeight: number;
  public numClasses: number;

  public numTrainElements: number;
  public numTestElements: number;

  public shuffledTrainIndex: number;
  public shuffledTestIndex: number;

  public datasetLabels: Uint8Array;
  public datasetImages: Float32Array;

  public trainIndices: Uint32Array;
  public testIndices: Uint32Array;

  public trainImages: Float32Array;
  public testImages: Float32Array;

  public trainLabels: Uint8Array;
  public testLabels: Uint8Array;
  

  constructor() {
    this.shuffledTrainIndex = 0;
    this.shuffledTestIndex = 0;
  }

  async load(data: MnistData, ratio: number) {
    this.datasetImages = data.datasetImages;
    this.datasetLabels = data.datasetLabels;

    this.imageSize = data.imageSize;
    this.imageWidth = data.imageWidth;
    this.imageHeight = data.imageHeight;
    this.numClasses = data.numClasses;

    this.numTrainElements = Math.floor(ratio * data.datasetLength);
    this.numTestElements = data.datasetLength - this.numTrainElements;

    // Create shuffled indices into the train/test set for when we select a
    // random dataset element for training / validation.
    this.trainIndices = tf.util.createShuffledIndices(this.numTrainElements);
    this.testIndices = tf.util.createShuffledIndices(this.numTestElements);

    // Slice the the images and labels into train and test sets.
    this.trainImages = this.datasetImages.slice(0, data.imageSize * this.numTrainElements);
    this.testImages = this.datasetImages.slice(data.imageSize * this.numTrainElements);
    this.trainLabels = this.datasetLabels.slice(0, NUM_CLASSES * this.numTrainElements);
    this.testLabels = this.datasetLabels.slice(NUM_CLASSES * this.numTrainElements);
  }

  nextTrainBatch(batchSize, imageSize) {
    return this.nextBatch(
        batchSize, [this.trainImages, this.trainLabels], () => {
          this.shuffledTrainIndex =
              (this.shuffledTrainIndex + 1) % this.trainIndices.length;
          return this.trainIndices[this.shuffledTrainIndex];
        }, imageSize);
  }

  nextTestBatch(batchSize, imageSize) {
    return this.nextBatch(batchSize, [this.testImages, this.testLabels], () => {
      this.shuffledTestIndex =
          (this.shuffledTestIndex + 1) % this.testIndices.length;
      return this.testIndices[this.shuffledTestIndex];
    }, imageSize);
  }

  nextBatch(batchSize, data, index, imageSize) {
    const batchImagesArray = new Float32Array(batchSize * imageSize);
    const batchLabelsArray = new Uint8Array(batchSize * NUM_CLASSES);

    for (let i = 0; i < batchSize; i++) {
      const idx = index();

      const image =
          data[0].slice(idx * imageSize, idx * imageSize + imageSize);
      batchImagesArray.set(image, i * imageSize);

      const label =
          data[1].slice(idx * NUM_CLASSES, idx * NUM_CLASSES + NUM_CLASSES);
      batchLabelsArray.set(label, i * NUM_CLASSES);
    }

    const xs = tf.tensor2d(batchImagesArray, [batchSize, imageSize]);
    const labels = tf.tensor2d(batchLabelsArray, [batchSize, NUM_CLASSES]);

    return {xs, labels};
  }
}