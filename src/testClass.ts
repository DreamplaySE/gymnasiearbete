import { MnistData } from "./data";
import { Request } from "./requestInterface";
import { Result } from "./resultInterface";

export class Test{
  public name: string;
  public test: (request: Request, mnistData: MnistData, testCount: number, testNumber: number) => Promise<Result>;

  constructor(_name: string, _test: (request: Request, mnistData: MnistData, testCount: number, testNumber: number) => Promise<Result>) {
    this.name = _name;
    this.test = _test;
  }
}