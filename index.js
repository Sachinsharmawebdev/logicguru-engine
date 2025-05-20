import { evaluateRules } from './src/evaluate.js';
import { resolveFilePath } from './src/utils/filepath.js';
import { resolveDynamicFilePath } from './src/utils/fileLoader.js';

export async function configureRuleEngine(rules, options = {}) {
  const { basePath = '', defaultContext = {} } = options;
  const files = { basePath };

  return async function runEngine(runtimeData = {}) {
    const runtimeContext = { ...defaultContext, ...runtimeData };
    for (const rule of rules) {
      if (rule.useFiles) {
        for (const [key, fileConfig] of Object.entries(rule.useFiles)) {
          const resolvedPath = await resolveFilePath(fileConfig.path, runtimeContext);
          const fileData = await resolveDynamicFilePath(files, resolvedPath); 
          runtimeContext[key] = fileData;
        }
      }
    }
    
    return await evaluateRules(rules, runtimeContext, files);
  };
}