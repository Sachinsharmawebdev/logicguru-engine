export async function evaluateCondition(condition, context) {
  try {
    if (condition.and) {
      const results = await Promise.all(
        condition.and.map(c => evaluateCondition(c, context))
      );
      const allTrue = results.every(Boolean);
      if (!allTrue) {
        console.warn("❌ AND condition failed:", condition.and, results);
      }
      return allTrue;
    }

    if (condition.or) {
      const results = await Promise.all(
        condition.or.map(c => evaluateCondition(c, context))
      );
      const anyTrue = results.some(Boolean);
      if (!anyTrue) {
        console.warn("❌ OR condition failed:", condition.or, results);
      }
      return anyTrue;
    }

    if (condition["=="]) {
      const [left, right] = condition["=="];
      const resolvedLeft = resolve(left, context);
      const resolvedRight = resolve(right, context);

      if (resolvedLeft === undefined || resolvedRight === undefined) {
        console.warn(`⚠️ Variable missing in context:`, {
          left,
          resolvedLeft,
          right,
          resolvedRight,
        });
      }

      const result = resolvedLeft === resolvedRight;
      if (!result) {
        console.warn(`❌ Equality failed: ${left} === ${right}`, {
          resolvedLeft,
          resolvedRight,
        });
      }

      return result;
    }

    // New includeIn operator (only for arrays)
    if (condition.includeIn) {
      const [valueToFind, array] = condition.includeIn;
      const resolvedValue = resolve(valueToFind, context);
      const resolvedArray = resolve(array, context);

      if (resolvedValue === undefined || resolvedArray === undefined) {
        console.warn(`⚠️ Variable missing in context:`, {
          valueToFind,
          resolvedValue,
          array,
          resolvedArray,
        });
        return false;
      }

      if (!Array.isArray(resolvedArray)) {
        console.warn(`⚠️ includeIn operator expects an array as second argument`);
        return false;
      }

      const result = resolvedArray.includes(resolvedValue);
      if (!result) {
        console.warn(`❌ includeIn failed: ${valueToFind} not found in array`, resolvedArray);
      }

      return result;
    }

    // New includeKey operator (checks if key exists in object)
    if (condition.includeKey) {
      const [keyToFind, object] = condition.includeKey;
      const resolvedKey = resolve(keyToFind, context);
      const resolvedObject = resolve(object, context);

      if (resolvedKey === undefined || resolvedObject === undefined) {
        console.warn(`⚠️ Variable missing in context:`, {
          keyToFind,
          resolvedKey,
          object,
          resolvedObject,
        });
        return false;
      }

      if (typeof resolvedObject !== 'object' || resolvedObject === null || Array.isArray(resolvedObject)) {
        console.warn(`⚠️ includeKey operator expects an object as second argument`);
        return false;
      }

      const result = Object.prototype.hasOwnProperty.call(resolvedObject, resolvedKey);
      if (!result) {
        console.warn(`❌ includeKey failed: key '${resolvedKey}' not found in object`, resolvedObject);
      }

      return result;
    }

    // New includeVal operator (checks if value exists in object's values)
    if (condition.includeVal) {
      const [valueToFind, object] = condition.includeVal;
      const resolvedValue = resolve(valueToFind, context);
      const resolvedObject = resolve(object, context);

      if (resolvedValue === undefined || resolvedObject === undefined) {
        console.warn(`⚠️ Variable missing in context:`, {
          valueToFind,
          resolvedValue,
          object,
          resolvedObject,
        });
        return false;
      }

      if (typeof resolvedObject !== 'object' || resolvedObject === null || Array.isArray(resolvedObject)) {
        console.warn(`⚠️ includeVal operator expects an object as second argument`);
        return false;
      }

      const result = Object.values(resolvedObject).includes(resolvedValue);
      if (!result) {
        console.warn(`❌ includeVal failed: value '${resolvedValue}' not found in object values`, resolvedObject);
      }

      return result;
    }
  } catch (err) {
    console.error("🔥 Condition evaluation error:", err, condition);
    return false;
  }

  console.warn("⚠️ Unrecognized condition structure:", condition);
  return false;
}

// Keep the existing resolve function as is
function resolve(value, context) {
  if (typeof value === "string" && value.startsWith("$")) {
    try {
      const path = value.slice(1).split(".");
      let result = context;
      for (const key of path) {
        if (result && Object.prototype.hasOwnProperty.call(result, key)) {
          result = result[key];
        } else {
          console.warn(`⚠️ Missing key '${key}' in path '${value}'`);
          return undefined;
        }
      }
      return result;
    } catch (err) {
      console.error("🔥 Error resolving path:", value, err);
      return undefined;
    }
  }
  return value;
}