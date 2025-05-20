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
      const resolvedMessage = resolveTemplateString(action.message, context);
      console.log(resolvedMessage);
      break;

    case 'assign':
      const value = resolveValue(action.value, context);
      if (value !== undefined) {
        result[action.key] = value;
      }
      break;

    case 'update': {
      debugger;
      const updateValue = resolveValue(action.value, context);
      if (updateValue !== undefined) {
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

        const targetPath = action.key.startsWith('$')
          ? action.key.slice(1)
          : action.key;

        setValueInContext(context, targetPath, updateValue);

        if (action.returnKey) {
          const returnPath = action.returnKey.startsWith('$')
            ? action.returnKey.slice(1)
            : action.returnKey;
          result = resolveValue(`$${returnPath}`, context);
        }
      }
      break;
    }

    case 'excludeVal': {
      const targetPath = action.key.startsWith('$')
        ? action.key.slice(1)
        : action.key;

      const excludeValue = resolveValue(action.exclude, context);
      const arrayToModify = resolveValue(action.key, context);

      if (Array.isArray(arrayToModify) && excludeValue !== undefined) {
        const newArray = arrayToModify.filter(item => item !== excludeValue);

        // Update the context

        setValueInContext(context, targetPath, newArray);

        // Prepare result
        if (action.returnKey) {
          const returnPath = action.returnKey.startsWith('$')
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
      const targetPath = action.key.startsWith('$')
        ? action.key.slice(1)
        : action.key;

      const pathParts = targetPath.split('.');
      let current = context;

      // Navigate to the parent of the key to delete
      for (let i = 0; i < pathParts.length - 1; i++) {
        if (current[pathParts[i]] === undefined) {
          console.warn(`Path not found: ${targetPath}`);
          break;
        }
        current = current[pathParts[i]];
      }

      // Delete the key
      const keyToDelete = pathParts[pathParts.length - 1];
      if (current[keyToDelete] !== undefined) {
        delete current[keyToDelete];

        // Prepare result
        if (action.returnKey) {
          const returnPath = action.returnKey.startsWith('$')
            ? action.returnKey.slice(1)
            : action.returnKey;
          result[returnPath] = resolveValue(`$${returnPath}`, context);
        } else {
          result[keyToDelete] = null; // Indicate deletion
        }
      }
      break;
    }
    // for excluding values from an array
    // Exclude values from an array based on a property
    case 'excludeFromArr': {
      // Resolve paths and values
      const targetPath = action.target.startsWith('$')
        ? action.target.slice(1)
        : action.target;

      const sourceArray = resolveValue(action.source, context);
      const matchProperty = action.matchProperty;
      const excludeValue = resolveValue(action.excludeValue, context);

      if (sourceArray && Array.isArray(sourceArray)) {
        // Convert excludeValue to array if it's not already
        const excludeValues = Array.isArray(excludeValue)
          ? excludeValue
          : [excludeValue];

        // Filter the array
        const filteredArray = sourceArray.filter(item => {
          if (typeof item === 'object' && item !== null && matchProperty in item) {
            return !excludeValues.includes(item[matchProperty]);
          }
          return true;
        });

        // Store result in context
        setValueInContext(context, targetPath, filteredArray);

        // Prepare return value
        if (action.returnKey) {
          const returnPath = action.returnKey.startsWith('$')
            ? action.returnKey.slice(1)
            : action.returnKey;
          result = resolveValue(`$${returnPath}`, context);
        }
      }
      break;
    }

    // include values in an array
    case 'includeFromArr': {
      // Resolve paths and values
      const targetPath = action.target.startsWith('$')
        ? action.target.slice(1)
        : action.target;

      const sourceArray = resolveValue(action.source, context);
      const matchProperty = action.matchProperty;
      const includeValue = resolveValue(action.includeValue, context);

      if (sourceArray && Array.isArray(sourceArray)) {
        // Convert includeValue to array if it's not already
        const includeValues = Array.isArray(includeValue)
          ? includeValue
          : [includeValue];

        // Filter the array to only include matches
        const includedArray = sourceArray.filter(item => {
          if (typeof item === 'object' && item !== null && matchProperty in item) {
            return includeValues.includes(item[matchProperty]);
          }
          return false;
        });

        // Store result in context
        setValueInContext(context, targetPath, includedArray);

        // Prepare return value
        if (action.returnKey) {
          const returnPath = action.returnKey.startsWith('$')
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
function resolveTemplateString(str, context, options = {}) {
  const {
    indent = null,      // JSON indentation
    circular = 'error'   // 'error'|'replace'|'ignore'
  } = options;

  if (typeof str !== 'string') return str;

  return str.replace(/\${([^}]+)}/g, (match, path) => {
    const value = resolveValue(`$${path}`, context);
    if (value === undefined) return match;

    if (typeof value === 'object') {
      try {
        return JSON.stringify(value, (key, val) => {
          if (typeof val === 'function') return undefined;
          if (val === undefined && circular === 'replace') return null;
          return val;
        }, indent);
      } catch (e) {
        return circular === 'error' ? `[Circular]` : '{}';
      }
    }
    return value.toString();
  });
}