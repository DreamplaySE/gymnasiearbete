import {MnistData} from './data';
import { prompt } from "enquirer";

// Adds the CPU backend to the global backend registry.
import '@tensorflow/tfjs-node';
import { runTests } from './tests';
import { Result } from "./resultInterface";
import { Request } from "./requestInterface";
import { processData } from './processing';
import { exporter, deleteCache, importer } from './cacher';

const ratio = 5 / 6;

interface Template extends Request {
  name: string;
}

const TestTemplates: Template[] = [
  {name: "1", ratio, batchSize: 128, epochs: 10},
  {name: "2", ratio, batchSize: 256, epochs: 10},
  {name: "3", ratio, batchSize: 512, epochs: 10}
];

const run = async () => {
  /*
  processData(results, data);

  console.log("Done here!");*/

  const MainMenuChoices = Object.freeze({
    "Run test": async () => {
      const responses = await prompt([{
        type: "select",
        choices: Object.keys(TestTemplates),
        message: "Which test do you want to run?",
        name: "testName"
      },{
        type: "input",
        message: "Which may times do you want the test to run?",
        name: "amount"
      }]);

      let testData: Request[] = [];

      for (let index = 0; index < (responses as any).amount; index++) {
        const template = TestTemplates[parseInt((responses as any).testName)];

        testData.push(template);
      }

      const mnistData = new MnistData();
      await mnistData.load();

      let results: Result[] = await runTests(testData, mnistData);

      await exporter(results);
    },
    "Manage templates": async () => {
      console.log("Exporting data.");
    },
    "Delete cache": async () => {
      console.log("Deleting cache.");
      await deleteCache();
      console.log("Deleted cache.");
    },
    "Export data": async () => {
      const responses = await prompt([{
        type: "multiselect",
        choices: Object.keys(TestTemplates),
        message: "Which tests do you want to export?",
        name: "testNames"
      },{
        type: "select",
        choices: ["Average out.", "Last run test."],
        message: "Which mode do you want to run export in?",
        name: "mode"
      }]);
      console.log("Exporting data.");
      console.log(responses);
    },
    "Exit": async () => {
      process.exit()    
    }
  });
  while(true) {
    const response = await prompt({
      type: "select",
      choices: Object.keys(MainMenuChoices),
      message: "What do you want to do?",
      name: "data"
    });

    await MainMenuChoices[(response as any).data]();
  }
}

run();