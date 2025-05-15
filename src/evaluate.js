import { evaluateCondition } from './utils/evaluator.js';
import { findInObject } from './utils/objectUtils.js';

export async function evaluateRules(rules, context, files = {}) {
  let resultData = {};
  
  for (const rule of rules) {
    if (await evaluateCondition(rule.condition, {...context, ...files})) {
      for (const action of rule.actions) {
        const newResultData = await applyAction(action, {...context, ...files});
        resultData = Object.assign({}, resultData, newResultData);
      }
    }
  }
  
  return resultData;
}

async function applyAction(action, context) {
  let result = [];
  switch (action.type) {
    case 'log':
      console.log(action.message);
      break;
    case 'assign':
      const value = typeof action.value === 'string' && action.value.startsWith('$')
        ? findInObject(context, action.value.slice(1))
        : action.value;
      result[action.key] = value;
      
      break;
    default:
      break;
  }

  return result;
}