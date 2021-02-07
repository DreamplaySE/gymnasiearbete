import * as fs from "fs";
import { resolve } from "path";
import { PNG } from "pngjs";
import * as ProgressBar from "progress";

const IMAGE_WIDTH = 28;
const IMAGE_HEIGHT = 28;

const IMAGE_SIZE = IMAGE_WIDTH * IMAGE_HEIGHT;

//4 bytes per pixel for R, G, B and A
const COLOR_CHANNEL_BYTES = 4;

const NUM_CLASSES = 10;

const MNIST_IMAGES_SPRITE_PATH =
  "./data/mnist_images.png";
const MNIST_LABELS_PATH =
  './data/mnist_labels_uint8';

export class MnistData {
  public datasetLength: number;

  public datasetLabels: Uint8Array;
  public datasetImages: Float32Array;

  public imageSize = IMAGE_SIZE;
  public imageWidth = IMAGE_WIDTH;
  public imageHeight = IMAGE_HEIGHT;
  public numClasses = NUM_CLASSES;

  async load() {
    //Initate png and load mnist image.
    let png = new PNG();
    await new Promise<void>((resolve) => fs.createReadStream(MNIST_IMAGES_SPRITE_PATH)
      .pipe(png)
      .on('parsed', (data) => {
        //Initializing array buffer.
        const datasetBytesBuffer = new ArrayBuffer(data.length / COLOR_CHANNEL_BYTES * Float32Array.BYTES_PER_ELEMENT);

        this.datasetLength = data.length / IMAGE_SIZE / COLOR_CHANNEL_BYTES;
        
        //Create progress bar
        var bar = new ProgressBar('Loading data [:bar] :rate images/s :percent :etas', { total: this.datasetLength });
        
        //For each image
        for (var y = 0; y < this.datasetLength; y++) {
          //Tick progress bar
          bar.tick();

          //Initialize array of 8 bit ints (number from 0 to 255)
          const datasetBytesView = new Float32Array(
            //Buffer
            datasetBytesBuffer,
            //Buffer Offset
            y * IMAGE_SIZE * Float32Array.BYTES_PER_ELEMENT,
            //Array Length
            IMAGE_SIZE
          );

          //For each pixel in image
          for (var x = 0; x < IMAGE_SIZE; x++) {
            //Get pixel offset
            var idx = (IMAGE_SIZE * y + x) * COLOR_CHANNEL_BYTES;

            //Get data of red channel
            var redChannel = data[idx] / 255;

            //Set integer to red channel value
            datasetBytesView[x] = redChannel;
          }
        }

        this.datasetImages = new Float32Array(datasetBytesBuffer);

        resolve();
      }
    ));

    //Read label data
    await new Promise<void>((resolve) => fs.readFile(MNIST_LABELS_PATH, (err, buffer) => {
      this.datasetLabels = new Uint8Array(buffer);
      resolve();
    }));
  }
}