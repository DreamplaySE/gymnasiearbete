import {MnistData} from './data';

// Adds the CPU backend to the global backend registry.
import '@tensorflow/tfjs-node';
import { runTests } from './tests';
import { Result } from "./resultInterface";
import { process } from './processing';

const run = async () => {
  const data = new MnistData();
  await data.load();

  const ratio = 5 / 6;

  const testData = [
    {mnistData: data, ratio, batchSize: 128, epochs: 10},
    {mnistData: data, ratio, batchSize: 256, epochs: 10},
    {mnistData: data, ratio, batchSize: 512, epochs: 10}
  ]

  let results: Result[] = await runTests(testData);

  process(results, data);

  console.log("Done here!");
}

run();