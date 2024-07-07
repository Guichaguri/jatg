import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import type { Ora } from 'ora';
import { replaceVariables } from './replaceVariables.js';
import { TemplateModel } from '../models/template.model.js';

export async function processTemplateFile(
  template: TemplateModel,
  variables: Map<string, string>,
  inputPath: string,
  baseOutputPath: string,
  relativeOutputPath: string,
  overwrite: boolean,
  ora?: Ora,
): Promise<string> {
  if (relativeOutputPath.toLowerCase().endsWith('.template'))
    relativeOutputPath = relativeOutputPath.substring(0, relativeOutputPath.length - '.template'.length);

  relativeOutputPath = replaceVariables(relativeOutputPath, template.variables, variables);

  ora?.start(relativeOutputPath);

  let contents = await readFile(inputPath, 'utf8');

  contents = replaceVariables(contents, template.variables, variables);

  const outputPath = join(baseOutputPath, relativeOutputPath);

  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, contents, {
    flag: overwrite ? 'w' : 'wx',
    encoding: 'utf8',
  });

  ora?.succeed(relativeOutputPath);

  return outputPath;
}
