import { MnistData } from "./data";
import { Result } from "./resultInterface";
import * as xl from "excel4node";

export const processData = async (data: Result[], mnistData: MnistData): Promise<void> => {
  const wb = new xl.Workbook();
  const ws = wb.addWorksheet('Results');

  const testCellWidth = 5;

  data.forEach((result, index) => {
    const columnOffset = index * testCellWidth;
    let row = 1;
    ws.cell(row, 1 + columnOffset).string("Batch Size");
    ws.cell(row, 2 + columnOffset).string("Epoch Count");
    ws.cell(row, 3 + columnOffset).string("Test/Train Ratio");
    ws.cell(row, 4 + columnOffset).string("Total Time");

    row += 1;
    ws.cell(row, 1 + columnOffset).number(result.request.batchSize);
    ws.cell(row, 2 + columnOffset).number(result.request.epochs);
    ws.cell(row, 3 + columnOffset).number(result.request.ratio);
    ws.cell(row, 4 + columnOffset).number(result.totalTime);

    row += 1;
    ws.cell(row, 1 + columnOffset).string("Time");
    ws.cell(row, 2 + columnOffset).string("Batch");
    ws.cell(row, 3 + columnOffset).string("Accuracy");
    ws.cell(row, 4 + columnOffset).string("Loss");

    row += 1;
    let totalBatchSize = 0;
    result.events.filter(event => event.event == "onBatchEnd").forEach((event, eventIndex) => {
      ws.cell(row + eventIndex, 1 + columnOffset).number(event.time);
      ws.cell(row + eventIndex, 2 + columnOffset).number(totalBatchSize += event.size);
      ws.cell(row + eventIndex, 3 + columnOffset).number(event.accuracy);
      ws.cell(row + eventIndex, 4 + columnOffset).number(event.loss);
    });
  })

  wb.write('out/Results.xlsx');
}