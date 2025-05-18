import fs from 'fs/promises';
import { configureRuleEngine } from '../index.js';

const data = await fs.readFile('./examples/rules.json', 'utf-8');
const rules = JSON.parse(data);

const context = {
  "get":{
    source: "evectus",
    baseProductId: "123344",
    agentId: "28325"
  },
  "res":{
    product:["12345", "123456"],
    productId: "123456",
    productName: "health",
    addon:["1234","0654","5464"]
  }
};

const engine = await configureRuleEngine(rules, {
  basePath: "./data",
  defaultContext: context
});

const result = await engine();
console.log(result);