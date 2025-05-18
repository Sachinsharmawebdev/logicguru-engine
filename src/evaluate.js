import { evaluateCondition } from './utils/evaluator.js';
export async function evaluateRules(rules, context, files = {}) {
  let resultData = {};

  for (const rule of rules) {
    if (await evaluateCondition(rule.condition, { ...context, ...files })) {
      for (const action of rule.actions) {
        const newResultData = await applyAction(action, { ...context, ...files });
        resultData = Object.assign({}, resultData, newResultData);
      }
    }
  }
  return resultData;
}

async function applyAction(action, context) {
  let result = {};

  switch (action.type) {
    case 'log':
      console.log(action.message);
      break;

    case 'assign':
      const value = resolveValue(action.value, context);
      if (value !== undefined) {
        result[action.key] = value;
      }
      break;

    case 'update': {
      const updateValue = resolveValue(action.value, context);
      if (updateValue !== undefined) {
        // Handle nested paths in action.key
        const setValueInContext = (obj, path, value) => {
          const keys = path.split('.');
          let current = obj;

          for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i];
            if (!current[key]) current[key] = {};
            current = current[key];
          }

          current[keys[keys.length - 1]] = value;
        };

        // Process the key (remove $ if present)
        const targetPath = action.key.startsWith('$')
          ? action.key.slice(1)
          : action.key;

        // Update the context
        setValueInContext(context, targetPath, updateValue);

        // Prepare result
        if (action.returnKey) {
          const returnPath = action.returnKey.startsWith('$')
            ? action.returnKey.slice(1)
            : action.returnKey;
          result[returnPath] = resolveValue(`$${returnPath}`, context);
        }
      }
      break;
    } 
    default:
      console.warn(`Unknown action type: ${action.type}`);
      break;
  }
  return result;
}


const resolveValue = (value, context) => {
  if (typeof value === 'string' && value.startsWith('$')) {
    const path = value.slice(1).split('.');
    let current = context;
    for (const part of path) {
      if (current && current.hasOwnProperty(part)) {
        current = current[part];
      } else {
        return undefined;
      }
    }
    return current;
  }
  return value;
};

// to evaluate the action