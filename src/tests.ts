import { MnistData } from "./data";
import { Test } from "./testClass";
import { TensorflowTest } from "./tests/tensorflow/test";
import { Request } from "./requestInterface";
import { Result } from "./resultInterface";

export const runTests = async (dataArray: Request[], mnistData: MnistData): Promise<Result[]> => {
  let results: Result[] = [];
  
  for (let i = 0; i < dataArray.length; i++) {
    results.push(await TensorflowTest.test(dataArray[i], mnistData, dataArray.length, i));
  }

  return results;
}