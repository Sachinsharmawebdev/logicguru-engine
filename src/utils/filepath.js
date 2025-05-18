export async function resolveFilePath(path, context) {
  return path.replace(/\${([^}]+)}|\$([a-zA-Z0-9_.]+)/g, (_, nestedPath, simplePath) => {
    const pathToResolve = nestedPath || simplePath;
    let result = context;
    
    for (const key of pathToResolve.split('.')) {
      if (result == null) {
        console.warn(`Missing context key '${key}' in path '${pathToResolve}'`);
        return ''; // Return empty string for missing keys
      }
      result = result[key];
    }
    
    return result !== undefined ? result : '';
  });
}