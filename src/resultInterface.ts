import { Request } from "./requestInterface";

export interface Event {
  time: number,
  event: string,
  batch: number,
  size: number,
  loss: number,
  accuracy: number
}

export interface Result {
  totalTime: number,
  events: Event[],
  request: Request
}