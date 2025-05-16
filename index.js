import { evaluateRules } from './src/evaluate.js';
import { resolveDynamicFilePath } from './src/utils/fileLoader.js';

export async function configureRuleEngine(rules, options = {}) {
  const { basePath = '', defaultContext = {} } = options;
  const files = { basePath };

  return async function runEngine(runtimeData = {}) {
    const runtimeContext = { ...defaultContext, ...runtimeData };
    for (const rule of rules) {
      if (rule.useFiles) {
        for (const [key, fileConfig] of Object.entries(rule.useFiles)) {
          const interpolated = fileConfig.path.replace(/\$([a-zA-Z0-9_]+)/g, (_, k) => runtimeContext[k] || k);
          const fileData = await resolveDynamicFilePath(files, interpolated); //basePath,filename
          runtimeContext[key] = fileData;
        }
      }
    }

    return await evaluateRules(rules, runtimeContext, files);
  };
}