import { relative, resolve, join } from 'node:path';
import type { Ora } from 'ora';
import { TemplateModel } from '../models/template.model.js';
import { processTemplateFile } from './processTemplateFile.js';
import { listAllFiles } from './listAllFiles.js';

export async function processTemplates(
  templates: TemplateModel[],
  variables: Map<string, string>,
  overwrite: boolean,
  basePath: string = './',
  ora?: Ora,
): Promise<void> {
  for (const template of templates) {
    for (const path of template.sourcePaths) {
      ora?.start(path);

      const [dirPath, files] = await listAllFiles(resolve(basePath, path));

      for (const inputPath of files) {
        const outputPath = join(template.outputPath, relative(dirPath, inputPath));

        await processTemplateFile(template, variables, inputPath, basePath, outputPath, overwrite, ora);
      }
    }
  }
}
