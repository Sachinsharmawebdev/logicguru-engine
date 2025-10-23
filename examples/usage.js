import fs from 'fs/promises';
import { configureRuleEngine } from '../index.js';

const data = await fs.readFile('./examples/rules.json', 'utf-8');
const rules = JSON.parse(data);

const context = {
  res:{
    status:200,
    message:"success",
    source:"evectus",
    engentId:"234231",
    data:{
      product:["12345", "123456"],
      productId: "123456",
      productName: "health",
      addon:[
        {
          "addonId":"1234",
          "addonName":"addon1",
          "selected": true,
          "isOTP":true
        },
        {
          "addonId":"0654",
          "addonName":"addon2",
          "selected": true,
          "isOTP":true
        },
        {
          "addonId":"5464",
          "addonName":"addon3",
          "selected": true,
          "isOTP":true
        }
      ]
    }
  }
};

const engine = await configureRuleEngine(rules, {
  basePath: "./data",
  defaultContext: context
});

const result = await engine();
console.log('Result:', JSON.stringify(result, null, 2));