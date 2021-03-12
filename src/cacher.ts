import { Result } from "./resultInterface";
import { writeFile, readFile, readdir, unlink } from "fs/promises";
import { Request } from "./requestInterface";
import * as ProgressBar from "progress";

const CACHE_PATH =
  './cache/';

export const deleteCache = async () => {
  await readdir(CACHE_PATH)
  .then(async (filePaths) => {
    var bar = new ProgressBar('Deleting cache [:bar] :rate files/s :percent :etas', { total: filePaths.length });

    filePaths.forEach(async path => {
      await unlink(CACHE_PATH + path);
      bar.tick();
    })
  });
}

export const importer = async (request: Request) => {
  let results: Result[] = [];

  await readdir(CACHE_PATH)
  .then(async (filePaths) => {
    const selectedFiles = filePaths.filter(val => new RegExp(`^(${serializeRequest(request)}).*(.cache)$`).test(val));
    selectedFiles.forEach(async path => {
      const result = JSON.parse(await readFile(
        /*File Name*/ CACHE_PATH + path,
        {
          encoding: "utf8"
        }
      )) as Result;
      results.push(result);
    })
  });

  return results;
};

export const exporter = async (results: Result[]) => {
  results.forEach(async result => {
    await writeFile(
      /*File Name*/ CACHE_PATH + serializeRequest(result.request) + result.startTime.toString() + ".cache",
      /*JSON*/ JSON.stringify(result),
      /*Options*/ {
        encoding: "utf8"
      }
    );
  });
};

const serializeRequest = (request: Request): string => {
  return request.batchSize.toString() + "-" +
  request.epochs.toString() + "-" +
  request.ratio + "-"
}