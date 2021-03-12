import { MnistData } from "./data";

export interface Request {
  ratio: number;
  batchSize: number;
  epochs: number;
}