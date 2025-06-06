import { evaluateCondition } from './utils/evaluator.js';
import * as dateUtils from './utils/dateUtils.js';
import { logger } from './utils/logger.js';

export async function evaluateRules(rules, context, files = {}) {
  let resultData = {};

  for (const rule of rules) {
    const debug = rule.debug || false;
    await logger(debug, '📝 Starting rule evaluation:', { ruleId: rule.id, context, files });

    if (await evaluateCondition(rule.condition, { ...context, ...files }, debug)) {
      await logger(debug, '✅ Rule conditions met, executing actions for rule:', rule.id);

      for (const action of rule.actions) {
        await logger(debug, '🔄 Executing action:', { type: action.type, details: action });
        const newResultData = await applyAction(action, { ...context, ...files }, debug);
        resultData = Object.assign({}, resultData, newResultData);
        await logger(debug, '✨ Action result:', { actionType: action.type, result: newResultData });
      }
    } else {
      await logger(debug, '❌ Rule conditions not met, skipping actions for rule:', rule.id);
    }
  }
  return resultData;
}

async function applyAction(action, context, debug = false) {
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

  switch (action.type) {
  case 'log':
    resolvedMessage = resolveTemplateString(action.message, context);
    await logger(debug, '📢 Log action:', { original: action.message, resolved: resolvedMessage });
    console.warn(resolvedMessage);
    break;

  case 'assign':
    value = resolveTemplateString(action.value, context);
    await logger(debug, '📝 Assign action:', { key: action.key, originalValue: action.value, resolvedValue: value });
    if (value !== undefined) {
      result[action.key] = value;
      await logger(debug, '✅ Value assigned:', { key: action.key, value });
    } else {
      await logger(debug, '⚠️ Undefined value, assignment skipped:', { key: action.key });
    }
    break;

  case 'update': {
    updateValue = resolveValue(action.value, context);
    await logger(debug, '🔄 Update action:', { key: action.key, originalValue: action.value, resolvedValue: updateValue });

    if (updateValue !== undefined) {
      targetPath = action.key.startsWith('$') ? action.key.slice(1) : action.key;
      await logger(debug, '📍 Target path:', { original: action.key, resolved: targetPath });

      setValueInContext(context, targetPath, updateValue);
      await logger(debug, '✅ Context updated at path:', { path: targetPath, value: updateValue });

      if (action.returnKey) {
        returnPath = action.returnKey.startsWith('$') ? action.returnKey.slice(1) : action.returnKey;
        result = resolveValue(`$${returnPath}`, context);
        await logger(debug, '📤 Return value resolved:', { returnKey: action.returnKey, result });
      }
    } else {
      await logger(debug, '⚠️ Update skipped - undefined value:', { key: action.key });
    }
    break;
  }

  case 'excludeVal': {
    targetPath = action.key.startsWith('$') ? action.key.slice(1) : action.key;
    excludeValue = resolveValue(action.exclude, context);
    arrayToModify = resolveValue(action.key, context);

    await logger(debug, '🗑️ ExcludeVal action:', {
      targetPath,
      excludeValue,
      originalArray: arrayToModify,
    });

    if (Array.isArray(arrayToModify) && excludeValue !== undefined) {
      newArray = arrayToModify.filter((item) => item !== excludeValue);
      await logger(debug, '✂️ Array filtered:', {
        originalLength: arrayToModify.length,
        newLength: newArray.length,
        excludedValue: excludeValue,
      });

      setValueInContext(context, targetPath, newArray);

      if (action.returnKey) {
        returnPath = action.returnKey.startsWith('$') ? action.returnKey.slice(1) : action.returnKey;
        result[returnPath] = resolveValue(`$${returnPath}`, context);
        await logger(debug, '📤 Return value set:', { returnKey: returnPath, value: result[returnPath] });
      } else {
        result[targetPath] = newArray;
        await logger(debug, '📤 Result set to new array:', { targetPath, array: newArray });
      }
    } else {
      await logger(debug, '⚠️ ExcludeVal skipped:', {
        isArray: Array.isArray(arrayToModify),
        hasExcludeValue: excludeValue !== undefined,
      });
    }
    break;
  }

  case 'deleteKey': {
    targetPath = action.key.startsWith('$') ? action.key.slice(1) : action.key;
    await logger(debug, '🗑️ DeleteKey action:', { targetPath });

    pathParts = targetPath.split('.');
    current = context;

    for (let i = 0; i < pathParts.length - 1; i++) {
      if (current[pathParts[i]] === undefined) {
        await logger(debug, '⚠️ Path not found:', { targetPath, failedAt: pathParts[i] });
        break;
      }
      current = current[pathParts[i]];
      await logger(debug, '🔍 Traversing path:', { part: pathParts[i], currentValue: current });
    }

    keyToDelete = pathParts[pathParts.length - 1];
    if (current[keyToDelete] !== undefined) {
      await logger(debug, '🗑️ Deleting key:', { key: keyToDelete, valueToDelete: current[keyToDelete] });
      delete current[keyToDelete];

      if (action.returnKey) {
        returnPath = action.returnKey.startsWith('$') ? action.returnKey.slice(1) : action.returnKey;
        result[returnPath] = resolveValue(`$${returnPath}`, context);
        await logger(debug, '📤 Return value after delete:', { returnKey: returnPath, value: result[returnPath] });
      } else {
        result[keyToDelete] = null;
        await logger(debug, '📤 Result set to null for deleted key:', { key: keyToDelete });
      }
    } else {
      await logger(debug, '⚠️ Key not found for deletion:', { key: keyToDelete });
    }
    break;
  }

  case 'excludeFromArr': {
    targetPath = action.target.startsWith('$') ? action.target.slice(1) : action.target;
    sourceArray = resolveValue(action.source, context);
    matchProperty = action.matchProperty;
    excludeValue = resolveValue(action.excludeValue, context);

    await logger(debug, '🔍 ExcludeFromArr started:', {
      targetPath,
      sourceArray,
      matchProperty,
      excludeValue,
    });

    if (sourceArray && Array.isArray(sourceArray)) {
      const excludeValues = Array.isArray(excludeValue) ? excludeValue : [excludeValue];
      await logger(debug, '📋 Processing exclude values:', excludeValues);

      const filteredArray = sourceArray.filter((item) => {
        if (typeof item === 'object' && item !== null && Object.prototype.hasOwnProperty.call(item, matchProperty)) {
          const shouldKeep = !excludeValues.includes(item[matchProperty]);
          logger(debug, '🔍 Checking item:', { item, matchPropertyValue: item[matchProperty], kept: shouldKeep });
          return shouldKeep;
        }
        return true;
      });

      setValueInContext(context, targetPath, filteredArray);
      await logger(debug, '✅ Array filtered:', {
        originalLength: sourceArray.length,
        newLength: filteredArray.length,
      });

      if (action.returnKey) {
        returnPath = action.returnKey.startsWith('$') ? action.returnKey.slice(1) : action.returnKey;
        result = resolveValue(`$${returnPath}`, context);
        await logger(debug, '📤 Return value set:', { returnKey: returnPath, value: result });
      }
    } else {
      await logger(debug, '⚠️ Invalid source array:', { sourceArray });
    }
    break;
  }

  case 'includeFromArr': {
    targetPath = action.target.startsWith('$') ? action.target.slice(1) : action.target;
    sourceArray = resolveValue(action.source, context);
    matchProperty = action.matchProperty;
    includeValue = resolveValue(action.includeValue, context);

    await logger(debug, '🔍 IncludeFromArr started:', {
      targetPath,
      sourceArray,
      matchProperty,
      includeValue,
    });

    if (sourceArray && Array.isArray(sourceArray)) {
      const includeValues = Array.isArray(includeValue) ? includeValue : [includeValue];
      await logger(debug, '📋 Processing include values:', includeValues);

      const includedArray = sourceArray.filter((item) => {
        if (typeof item === 'object' && item !== null && Object.prototype.hasOwnProperty.call(item, matchProperty)) {
          const shouldInclude = includeValues.includes(item[matchProperty]);
          logger(debug, '🔍 Checking item:', { item, matchPropertyValue: item[matchProperty], included: shouldInclude });
          return shouldInclude;
        }
        return false;
      });

      setValueInContext(context, targetPath, includedArray);
      await logger(debug, '✅ Array filtered for inclusion:', {
        originalLength: sourceArray.length,
        includedLength: includedArray.length,
      });

      if (action.returnKey) {
        returnPath = action.returnKey.startsWith('$') ? action.returnKey.slice(1) : action.returnKey;
        result = resolveValue(`$${returnPath}`, context);
        await logger(debug, '📤 Return value set:', { returnKey: returnPath, value: result });
      }
    } else {
      await logger(debug, '⚠️ Invalid source array:', { sourceArray });
    }
    break;
  }
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
