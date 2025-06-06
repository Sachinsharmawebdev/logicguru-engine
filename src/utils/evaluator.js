import { year, month, day } from './dateUtils.js';
import { logger } from './logger.js';

export async function evaluateCondition(condition, context, debug = false) {
  try {
    await logger(debug, '🔍 Evaluating condition:', condition);

    if (condition.and) {
      await logger(debug, '📋 Processing AND condition with subconditions:', condition.and);
      const results = await Promise.all(
        condition.and.map(async (c, index) => {
          await logger(debug, `📊 Evaluating AND subcondition ${index + 1}:`, c);
          const result = await evaluateCondition(c, context, debug);
          await logger(debug, `${result ? '✅' : '❌'} AND subcondition ${index + 1} result:`, { condition: c, result });
          return result;
        }),
      );
      const allTrue = results.every(Boolean);
      await logger(debug, `${allTrue ? '✅' : '❌'} AND condition final result:`, { results, allTrue });
      return allTrue;
    }

    if (condition.or) {
      await logger(debug, '📋 Processing OR condition with subconditions:', condition.or);
      const results = await Promise.all(
        condition.or.map(async (c, index) => {
          await logger(debug, `📊 Evaluating OR subcondition ${index + 1}:`, c);
          const result = await evaluateCondition(c, context, debug);
          await logger(debug, `${result ? '✅' : '❌'} OR subcondition ${index + 1} result:`, { condition: c, result });
          return result;
        }),
      );
      const anyTrue = results.some(Boolean);
      await logger(debug, `${anyTrue ? '✅' : '❌'} OR condition final result:`, { results, anyTrue });
      return anyTrue;
    }

    if (condition['==']) {
      const [left, right] = condition['=='];
      const resolvedLeft = resolve(left, context);
      const resolvedRight = resolve(right, context);

      await logger(debug, '🔍 Evaluating equality:', {
        original: { left, right },
        resolved: { left: resolvedLeft, right: resolvedRight },
      });

      const result = resolvedLeft === resolvedRight;
      await logger(debug, `${result ? '✅' : '❌'} Equality result:`, {
        comparison: `${resolvedLeft} === ${resolvedRight}`,
        result,
      });
      return result;
    }

    if (condition['!=']) {
      const [left, right] = condition['!='];
      const resolvedLeft = resolve(left, context);
      const resolvedRight = resolve(right, context);

      await logger(debug, '🔍 Evaluating inequality:', {
        original: { left, right },
        resolved: { left: resolvedLeft, right: resolvedRight },
      });

      const result = resolvedLeft !== resolvedRight;
      await logger(debug, `${result ? '✅' : '❌'} Inequality result:`, {
        comparison: `${resolvedLeft} !== ${resolvedRight}`,
        result,
      });
      return result;
    }

    if (condition['>']) {
      const [left, right] = condition['>'];
      const resolvedLeft = resolve(left, context);
      const resolvedRight = resolve(right, context);

      await logger(debug, '🔍 Evaluating greater than:', {
        original: { left, right },
        resolved: { left: resolvedLeft, right: resolvedRight },
      });

      const result = resolvedLeft > resolvedRight;
      await logger(debug, `${result ? '✅' : '❌'} Greater than result:`, {
        comparison: `${resolvedLeft} > ${resolvedRight}`,
        result,
      });
      return result;
    }

    if (condition['<']) {
      const [left, right] = condition['<'];
      const resolvedLeft = resolve(left, context);
      const resolvedRight = resolve(right, context);

      await logger(debug, '🔍 Evaluating less than:', {
        original: { left, right },
        resolved: { left: resolvedLeft, right: resolvedRight },
      });

      const result = resolvedLeft < resolvedRight;
      await logger(debug, `${result ? '✅' : '❌'} Less than result:`, {
        comparison: `${resolvedLeft} < ${resolvedRight}`,
        result,
      });
      return result;
    }

    if (condition['>=']) {
      const [left, right] = condition['>='];
      const resolvedLeft = resolve(left, context);
      const resolvedRight = resolve(right, context);

      await logger(debug, '🔍 Evaluating greater than or equal:', {
        original: { left, right },
        resolved: { left: resolvedLeft, right: resolvedRight },
      });

      const result = resolvedLeft >= resolvedRight;
      await logger(debug, `${result ? '✅' : '❌'} Greater than or equal result:`, {
        comparison: `${resolvedLeft} >= ${resolvedRight}`,
        result,
      });
      return result;
    }

    if (condition['<=']) {
      const [left, right] = condition['<='];
      const resolvedLeft = resolve(left, context);
      const resolvedRight = resolve(right, context);

      await logger(debug, '🔍 Evaluating less than or equal:', {
        original: { left, right },
        resolved: { left: resolvedLeft, right: resolvedRight },
      });

      const result = resolvedLeft <= resolvedRight;
      await logger(debug, `${result ? '✅' : '❌'} Less than or equal result:`, {
        comparison: `${resolvedLeft} <= ${resolvedRight}`,
        result,
      });
      return result;
    }

    await logger(debug, '⚠️ No valid condition operator found:', condition);
    return false;

  } catch (error) {
    await logger(debug, '❌ Error in condition evaluation:', { error: error.message, condition });
    throw error;
  }
}

// Keep the existing resolve function as is
function resolve(value, context) {
  if (typeof value !== 'string') return value;

  // Handle template-style paths like `${user.name}_slug.json` or `${year($res.birthDt)}`
  if (value.includes('${')) {
    try {
      // Replace ${path} with resolved values
      const resolvedPath = value.replace(/\${([^}]+)}/g, (_, path) => {
        // Check for date functions
        const yearMatch = path.match(/^year\(([^)]+)\)$/);
        const monthMatch = path.match(/^month\(([^)]+)\)$/);
        const dayMatch = path.match(/^day\(([^)]+)\)$/);

        if (yearMatch) {
          const dateValue = resolve(yearMatch[1], context);
          return dateValue ? year(dateValue) : '';
        }
        if (monthMatch) {
          const dateValue = resolve(monthMatch[1], context);
          return dateValue ? month(dateValue) : '';
        }
        if (dayMatch) {
          const dateValue = resolve(dayMatch[1], context);
          return dateValue ? day(dateValue) : '';
        }

        // Handle regular path resolution
        const val = resolve(`$${path}`, context);
        return val !== undefined ? val : '';
      });
      return resolvedPath;
    } catch (err) {
      console.warn(`🚨 Template resolution failed for '${value}'`, err);
      return undefined;
    }
  }

  // Original path resolution for simple $ paths
  if (value.startsWith('$')) {
    const path = value.slice(1).split('.');
    let result = context;
    for (const key of path) {
      if (result == null) {
        console.warn(`Path stopped at '${key}' in '${value}'`);
        return undefined;
      }
      result = result[key];
    }
    return result;
  }

  return value;
}
