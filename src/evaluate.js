import { evaluateCondition } from './utils/evaluator.js';
import * as dateUtils from './utils/dateUtils.js';

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
  let resolvedMessage;
  let value;
  let updateValue;
  let targetPath;
  let returnPath;
  let excludeValue;
  let arrayToModify;
  let newArray;
  let pathParts;
  let current;
  let keyToDelete;
  let sourceArray;
  let matchProperty;
  let includeValue;
  let includeKeys;
  let includeValues;
  let keysToInclude;
  let includedArray;

  switch (action.type) {
  case 'log':
    resolvedMessage = resolveTemplateString(action.message, context);
    console.warn(resolvedMessage);
    break;

  case 'assign':
    value = resolveTemplateString(action.value, context);
    if (value !== undefined) {
      result[action.key] = value;
    }
    break;

  case 'update': {
    updateValue = resolveValue(action.value, context);
    if (updateValue !== undefined) {
      targetPath = action.key.startsWith('$')
        ? action.key.slice(1)
        : action.key;

      setValueInContext(context, targetPath, updateValue);

      if (action.returnKey) {
        returnPath = action.returnKey.startsWith('$')
          ? action.returnKey.slice(1)
          : action.returnKey;
        result = resolveValue(`$${returnPath}`, context);
      }
    }
    break;
  }

  case 'excludeVal': {
    targetPath = action.key.startsWith('$')
      ? action.key.slice(1)
      : action.key;

    excludeValue = resolveValue(action.exclude, context);
    arrayToModify = resolveValue(action.key, context);

    if (Array.isArray(arrayToModify) && excludeValue !== undefined) {
      newArray = arrayToModify.filter((item) => item !== excludeValue);

      setValueInContext(context, targetPath, newArray);

      if (action.returnKey) {
        returnPath = action.returnKey.startsWith('$')
          ? action.returnKey.slice(1)
          : action.returnKey;
        result[returnPath] = resolveValue(`$${returnPath}`, context);
      } else {
        result[targetPath] = newArray;
      }
    }
    break;
  }

  case 'deleteKey': {
    targetPath = action.key.startsWith('$')
      ? action.key.slice(1)
      : action.key;

    pathParts = targetPath.split('.');
    current = context;

    for (let i = 0; i < pathParts.length - 1; i++) {
      if (current[pathParts[i]] === undefined) {
        console.warn(`Path not found: ${targetPath}`);
        break;
      }
      current = current[pathParts[i]];
    }

    keyToDelete = pathParts[pathParts.length - 1];
    if (current[keyToDelete] !== undefined) {
      delete current[keyToDelete];

      if (action.returnKey) {
        returnPath = action.returnKey.startsWith('$')
          ? action.returnKey.slice(1)
          : action.returnKey;
        result[returnPath] = resolveValue(`$${returnPath}`, context);
      } else {
        result[keyToDelete] = null;
      }
    }
    break;
  }

  case 'excludeFromArr': {
    targetPath = action.target.startsWith('$')
      ? action.target.slice(1)
      : action.target;

    sourceArray = resolveValue(action.source, context);
    matchProperty = action.matchProperty;
    excludeValue = resolveValue(action.excludeValue, context);

    if (sourceArray && Array.isArray(sourceArray)) {
      const excludeValues = Array.isArray(excludeValue)
        ? excludeValue
        : [excludeValue];

      const filteredArray = sourceArray.filter((item) => {
        if (typeof item === 'object' && item !== null && Object.prototype.hasOwnProperty.call(item, matchProperty)) {
          return !excludeValues.includes(item[matchProperty]);
        }
        return true;
      });

      setValueInContext(context, targetPath, filteredArray);

      if (action.returnKey) {
        returnPath = action.returnKey.startsWith('$')
          ? action.returnKey.slice(1)
          : action.returnKey;
        result = resolveValue(`$${returnPath}`, context);
      }
    }
    break;
  }

  case 'includeFromArr': {
    targetPath = action.target.startsWith('$')
      ? action.target.slice(1)
      : action.target;

    sourceArray = resolveValue(action.source, context);
    matchProperty = action.matchProperty;
    includeValue = resolveValue(action.includeValue, context);
    includeKeys = action.includeKeys ? resolveValue(action.includeKeys, context) : null;

    if (sourceArray && Array.isArray(sourceArray)) {
      includeValues = Array.isArray(includeValue) ? includeValue : [includeValue];
      keysToInclude = includeKeys ?
        (Array.isArray(includeKeys) ? includeKeys : [includeKeys]) :
        null;

      includedArray = sourceArray.reduce((acc, item) => {
        if (typeof item === 'object' && item !== null && Object.prototype.hasOwnProperty.call(item, matchProperty)) {
          if (includeValues.includes(item[matchProperty])) {
            if (keysToInclude) {
              const filteredItem = {};
              keysToInclude.forEach((key) => {
                if (Object.prototype.hasOwnProperty.call(item, key)) {
                  filteredItem[key] = item[key];
                }
              });
              acc.push(filteredItem);
            } else {
              acc.push(item);
            }
          }
        }
        return acc;
      }, []);

      setValueInContext(context, targetPath, includedArray);

      if (action.returnKey) {
        returnPath = action.returnKey.startsWith('$')
          ? action.returnKey.slice(1)
          : action.returnKey;
        result = resolveValue(`$${returnPath}`, context);
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
      if (current && Object.prototype.hasOwnProperty.call(current, part)) {
        current = current[part];
      } else {
        return undefined;
      }
    }
    return current;
  }
  return value;
};

// set value in context
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

// New helper function to resolve template strings
function resolveTemplateString(template, context) {
  if (typeof template !== 'string') return template;

  // Check for date functions
  const dateFuncMatch = template.match(/\${(year|month|day)\(([^)]+)\)}/);
  if (dateFuncMatch) {
    const [, funcName, datePath] = dateFuncMatch;
    const dateValue = resolveValue(datePath, context);
    if (!dateValue) {
      console.warn(`Date value not found in context: ${datePath}`);
      return '';
    }
    const dateFunc = dateUtils[funcName];
    if (!dateFunc) {
      console.warn(`Unknown date function: ${funcName}`);
      return '';
    }
    return dateFunc(dateValue);
  }

  // Handle regular path resolution
  return template.replace(/\${([^}]+)}/g, (_, path) => {
    const value = resolveValue(path, context);
    return value !== undefined ? value : '';
  });
}
