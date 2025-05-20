import fs from 'fs/promises';
import { configureRuleEngine } from '../index.js';

const data = await fs.readFile('./examples/rules.json', 'utf-8');
const rules = JSON.parse(data);

const context = {
  get:{
    status:200,
    message:"success",
    "data":{
      product:["12345", "123456"],
      "productId": "123456",
      productName: "health",
      addon:["1234","0654","5464"]
    }
  },
  res:{
    product:["12345", "123456"],
    productId: "123456",
    productName: "health",
    addon:["1234","0654","5464"]
  }
};

console.log("context", context);
debugger;
const engine = await configureRuleEngine(rules, {
  basePath: "./data",
  defaultContext: context
});

const result = await engine();
console.log(result);