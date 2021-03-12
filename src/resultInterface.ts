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
  startTime: number,
  totalTime: number,
  events: Event[],
  request: Request
}