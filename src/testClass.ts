import { Request } from "./requestInterface";
import { Result } from "./resultInterface";

export class Test{
  public name: string;
  public test: (data: Request) => Promise<Result>;

  constructor(_name: string, _test: (data: Request) => Promise<Result>) {
    this.name = _name;
    this.test = _test;
  }
}