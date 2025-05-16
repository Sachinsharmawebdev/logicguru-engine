import fs from 'fs/promises';
import { configureRuleEngine } from '../index.js';

const data = await fs.readFile('./examples/rules.json', 'utf-8');
const rules = JSON.parse(data);

const context = {
  source: "evectus",
  baseProductId: "123344",
  agentId: "28325"
};

const engine = await configureRuleEngine(rules, {
  basePath: "./data",
  defaultContext: context
});

const result = await engine();
console.log(result);