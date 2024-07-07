import { lstat, readdir } from 'node:fs/promises';
import { relative, resolve, join } from 'node:path';
import type { Ora } from 'ora';
import { TemplateModel } from './models/template.model.js';
import { processTemplateFile } from './utils/processTemplateFile.js';

async function listFiles(dir: string): Promise<string[]> {
  const dirents = await readdir(dir, { withFileTypes: true });

  const files = await Promise.all(dirents.map(dirent => {
    const path = resolve(dir, dirent.name);
    return dirent.isDirectory() ? listFiles(path) : [path];
  }));

  return files.flat();
}

async function listAllFiles(inputPath: string): Promise<string[]> {
  const stat = await lstat(inputPath);

  if (stat.isFile())
    return [inputPath];

  return await listFiles(inputPath);
}

export async function processTemplate(
  templates: TemplateModel[],
  variables: Map<string, string>,
  overwrite: boolean,
  basePath: string = './',
  ora?: Ora,
): Promise<void> {
  for (const template of templates) {
    for (const path of template.sourcePaths) {
      ora?.start(path);

      const fullPath = resolve(basePath, path);
      const files = await listAllFiles(fullPath);

      for (const inputPath of files) {
        const outputPath = join(template.outputPath, relative(fullPath, inputPath));

        await processTemplateFile(template, variables, inputPath, basePath, outputPath, overwrite, ora);
      }
    }
  }
}
