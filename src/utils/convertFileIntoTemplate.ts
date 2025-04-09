import { join, relative } from 'node:path';
import { readFile } from 'node:fs/promises';
import type { Ora } from 'ora';
import { TemplateVariableReplacement, VariableOperation } from '../models/template.model.js';
import { processVariableOperations } from './processVariableOperations.js';
import { listAllFiles, saveFile } from './listAllFiles.js';
import { showError } from './showError.js';

/**
 * Converts a source file into a template, replacing search strings into variables
 *
 * @param path The source files
 * @param output The output directory
 * @param variables The variables with needle strings that will be searched and replaced
 * @param overwrite Whether it will overwrite any files
 * @param ora The Ora's spinner instance
 */
export async function convertFileIntoTemplate(
  path: string,
  output: string,
  variables: TemplateVariableReplacement[],
  overwrite: boolean = false,
  ora?: Ora,
): Promise<void> {
  const replacements = variables
    .flatMap(item => createVariableReplacements(item.variable, item.needle, item.preprocessing));

  const [dirPath, files] = await listAllFiles(path);

  for (const inputPath of files) {
    try {
      let outputPath = relative(dirPath, inputPath);

      outputPath = replaceTemplateVariables(outputPath, replacements);

      if (!outputPath.endsWith('.template'))
        outputPath += '.template';

      ora?.start(outputPath);

      let content = await readFile(inputPath, 'utf8');

      content = replaceTemplateVariables(content, replacements);

      await saveFile(join(output, outputPath), content, overwrite);

      ora?.succeed(outputPath);
    } catch (error) {
      showError(error, ora);
    }
  }
}

function replaceTemplateVariables(content: string, variables: VariableReplacement[]): string {
  return variables.reduce((prev, variable) => {
    return prev.split(variable.needle).join(variable.replacement);
  }, content);
}

interface VariableReplacement {
  needle: string;
  replacement: string;
}

function createVariableReplacements(
  variable: string,
  str: string,
  preprocessing: VariableOperation[] = [],
): VariableReplacement[] {
  const processing: VariableOperation[][] = [
    ['plural', 'pascalCase'],
    ['singular', 'pascalCase'],
    ['plural', 'camelCase'],
    ['singular', 'camelCase'],
    ['plural', 'pathCase'],
    ['singular', 'pathCase'],
    ['plural', 'dotCase'],
    ['singular', 'dotCase'],
    ['plural', 'snakeCase'],
    ['singular', 'snakeCase'],
    ['plural', 'kebabCase'],
    ['singular', 'kebabCase'],
    ['plural', 'constantCase'],
    ['singular', 'constantCase'],
    ['plural', 'sentenceCase'],
    ['singular', 'sentenceCase'],
    ['plural', 'capitalCase'],
    ['singular', 'capitalCase'],
    ['plural', 'lower'],
    ['singular', 'lower'],
    ['plural', 'upper'],
    ['singular', 'upper'],
    [],
  ];

  return processing.map(steps => {
    const functions = steps.filter(step => !preprocessing.includes(step));

    const needle = processVariableOperations(str, [...preprocessing, ...functions]);
    const replacement = `%${variable}${functions.map(step => '.' + step).join('')}%`;

    return { needle, replacement };
  });
}
