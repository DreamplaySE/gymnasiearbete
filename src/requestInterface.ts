import { MnistData } from "./data";

export interface Request {
  mnistData: MnistData;
  ratio: number;
  batchSize: number;
  epochs: number;
  repeat?: number;
}