import fs from 'fs/promises';
import path from 'path';

export async function resolveDynamicFilePath(files, relPath) {
  const fullPath = path.join(files.basePath, relPath);
  const content = await fs.readFile(fullPath, 'utf-8');
  return JSON.parse(content);
}