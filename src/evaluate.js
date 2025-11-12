import { evaluateCondition } from './utils/evaluator.js';
import * as dateUtils from './utils/dateUtils.js';

export async function evaluateRules(rules, context, files = {}) {
  let resultData = {};
  const mergedContext = { ...context, ...files };

  for (const rule of rules) {
    if (await evaluateCondition(rule.condition, mergedContext)) {
      for (const action of rule.actions) {
        const newResultData = await applyAction(action, mergedContext, context);
        resultData = Object.assign({}, resultData, newResultData);
      }
    }
  }
  return resultData;
}

async function applyAction(action, context, originalContext = context) {
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
    value = resolveValue(action.value, context);
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
          const itemValue = item[matchProperty];
          const shouldExclude = excludeValues.some((excludeVal) =>
            Array.isArray(excludeVal) ? excludeVal.includes(itemValue) : itemValue === excludeVal,
          );
          return !shouldExclude;
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
          const itemValue = item[matchProperty];
          const shouldInclude = includeValues.some((includeVal) =>
            Array.isArray(includeVal) ? includeVal.includes(itemValue) : itemValue === includeVal,
          );
          if (shouldInclude) {
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

  case 'deleteKeyFromArray': {
    targetPath = action.target.startsWith('$') ? action.target.slice(1) : action.target;
    sourceArray = resolveValue(action.source, context);
    matchProperty = action.matchProperty;
    const matchValue = resolveValue(action.matchValue, context);
    const keysToDelete = Array.isArray(action.deleteKeys) ? action.deleteKeys : [action.deleteKeys];

    if (sourceArray && Array.isArray(sourceArray)) {
      const modifiedArray = sourceArray.map((item) => {
        if (typeof item === 'object' && item !== null && Object.prototype.hasOwnProperty.call(item, matchProperty)) {
          const itemValue = item[matchProperty];
          const shouldModify = Array.isArray(matchValue) ? matchValue.includes(itemValue) : itemValue === matchValue;

          if (shouldModify) {
            const modifiedItem = { ...item };
            keysToDelete.forEach((key) => delete modifiedItem[key]);
            return modifiedItem;
          }
        }
        return item;
      });

      setValueInContext(context, targetPath, modifiedArray);

      if (action.returnKey) {
        returnPath = action.returnKey.startsWith('$') ? action.returnKey.slice(1) : action.returnKey;
        result = resolveValue(`$${returnPath}`, context);
      } else {
        result[targetPath] = modifiedArray;
      }
    }
    break;
  }

  case 'updateKeyInArray': {
    targetPath = action.target.startsWith('$') ? action.target.slice(1) : action.target;
    sourceArray = resolveValue(action.source, context);
    matchProperty = action.matchProperty;
    const matchValue = resolveValue(action.matchValue, context);
    const updates = action.updates || {};

    if (sourceArray && Array.isArray(sourceArray)) {
      const modifiedArray = sourceArray.map((item) => {
        if (typeof item === 'object' && item !== null && Object.prototype.hasOwnProperty.call(item, matchProperty)) {
          const itemValue = item[matchProperty];
          const shouldModify = Array.isArray(matchValue) ? matchValue.includes(itemValue) : itemValue === matchValue;

          if (shouldModify) {
            const modifiedItem = { ...item };
            for (const [key, value] of Object.entries(updates)) {
              modifiedItem[key] = resolveValue(value, context);
            }
            return modifiedItem;
          }
        }
        return item;
      });

      setValueInContext(context, targetPath, modifiedArray);

      if (action.returnKey) {
        returnPath = action.returnKey.startsWith('$') ? action.returnKey.slice(1) : action.returnKey;
        result = resolveValue(`$${returnPath}`, context);
      } else {
        result[targetPath] = modifiedArray;
      }
    }
    break;
  }

  case 'addKeyToArray': {
    targetPath = action.target.startsWith('$') ? action.target.slice(1) : action.target;
    sourceArray = resolveValue(action.source, context);
    matchProperty = action.matchProperty;
    const matchValue = resolveValue(action.matchValue, context);
    const additions = action.additions || {};

    if (sourceArray && Array.isArray(sourceArray)) {
      const modifiedArray = sourceArray.map((item) => {
        if (typeof item === 'object' && item !== null && Object.prototype.hasOwnProperty.call(item, matchProperty)) {
          const itemValue = item[matchProperty];
          const shouldModify = Array.isArray(matchValue) ? matchValue.includes(itemValue) : itemValue === matchValue;

          if (shouldModify) {
            const modifiedItem = { ...item };
            for (const [key, value] of Object.entries(additions)) {
              modifiedItem[key] = resolveValue(value, context);
            }
            return modifiedItem;
          }
        }
        return item;
      });

      setValueInContext(context, targetPath, modifiedArray);

      if (action.returnKey) {
        returnPath = action.returnKey.startsWith('$') ? action.returnKey.slice(1) : action.returnKey;
        result = resolveValue(`$${returnPath}`, context);
      } else {
        result[targetPath] = modifiedArray;
      }
    }
    break;
  }

  case 'filterArray': {
    targetPath = action.target.startsWith('$') ? action.target.slice(1) : action.target;
    sourceArray = resolveValue(action.source, context);
    matchProperty = action.matchProperty;
    const matchValue = resolveValue(action.matchValue, context);
    const operator = action.operator || '==';


    if (sourceArray && Array.isArray(sourceArray)) {
      const filteredArray = sourceArray.filter((item) => {
        if (typeof item === 'object' && item !== null && Object.prototype.hasOwnProperty.call(item, matchProperty)) {
          const itemValue = item[matchProperty];
          
          if (operator === '==') {
            return Array.isArray(matchValue) ? matchValue.includes(itemValue) : itemValue === matchValue;
          }
          
          let shouldInclude = false;
          switch (operator) {
          case '>':
            shouldInclude = itemValue > matchValue;
            break;
          case '<':
            shouldInclude = itemValue < matchValue;
            break;
          case '>=':
            shouldInclude = itemValue >= matchValue;
            break;
          case '<=':
            shouldInclude = itemValue <= matchValue;
            break;
          case '!=':
            shouldInclude = Array.isArray(matchValue) ? !matchValue.includes(itemValue) : itemValue !== matchValue;
            break;
          }
          return shouldInclude;
        }
        return false;
      });


      setValueInContext(context, targetPath, filteredArray);

      if (action.returnKey) {
        returnPath = action.returnKey.startsWith('$') ? action.returnKey.slice(1) : action.returnKey;
        result = resolveValue(`$${returnPath}`, context);
      } else {
        result[targetPath] = filteredArray;
      }
    }
    break;
  }

  case 'filterObject': {
    targetPath = action.target.startsWith('$') ? action.target.slice(1) : action.target;
    const sourceObject = resolveValue(action.source, context);
    const filterBy = action.filterBy; // 'key' or 'value'
    const operator = action.operator; // '>', '<', '>=', '<=', '==', '!='
    const compareValue = resolveValue(action.compareValue, context);

    if (sourceObject && typeof sourceObject === 'object' && !Array.isArray(sourceObject)) {
      const filteredObject = {};
      
      for (const [key, value] of Object.entries(sourceObject)) {
        const testValue = filterBy === 'key' ? Number(key) : value;
        let shouldInclude = false;
        
        switch (operator) {
        case '>':
          shouldInclude = testValue > compareValue;
          break;
        case '<':
          shouldInclude = testValue < compareValue;
          break;
        case '>=':
          shouldInclude = testValue >= compareValue;
          break;
        case '<=':
          shouldInclude = testValue <= compareValue;
          break;
        case '==':
          shouldInclude = testValue == compareValue;
          break;
        case '!=':
          shouldInclude = testValue != compareValue;
          break;
        }
        
        if (shouldInclude) {
          filteredObject[key] = value;
        }
      }

      setValueInContext(context, targetPath, filteredObject);

      if (action.returnKey) {
        returnPath = action.returnKey.startsWith('$') ? action.returnKey.slice(1) : action.returnKey;
        result = resolveValue(`$${returnPath}`, context);
      } else {
        result[targetPath] = filteredObject;
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
  
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    const resolved = {};
    for (const [key, val] of Object.entries(value)) {
      resolved[key] = resolveValue(val, context);
    }
    return resolved;
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
