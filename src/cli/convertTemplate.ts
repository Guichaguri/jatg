import { resolve } from 'node:path';
import type { Ora } from 'ora';
import { convertFileIntoTemplate } from '../utils/convertFileIntoTemplate.js';
import { prompt } from '../utils/prompt.js';
import { TemplateVariable, TemplateVariableReplacement } from '../models/template.model.js';

export async function convertTemplate(
  variables: TemplateVariable[],
  outputPath: string,
  basePath: string,
  overwrite?: boolean,
  spinner?: Ora,
): Promise<void> {
  if (variables.length === 0) {
    return;
  }

  const { sourceTemplatePath } = await prompt([
    {
      name: 'sourceTemplatePath',
      type: 'text',
      message: 'What is the path where the files that will be converted are?',
      validate: value => !value ? 'The path cannot be empty' : true,
    },
  ]);

  const variableReplacements: TemplateVariableReplacement[] = [];

  for (const item of variables) {
    const { needle } = await prompt([
      {
        name: 'needle',
        type: 'text',
        message: 'What string will be replaced to %' + item.variable + '%?',
        initial: item.variable,
      }
    ]);

    variableReplacements.push({
      ...item,
      needle,
    })
  }

  console.log();

  await convertFileIntoTemplate(
    resolve(basePath, sourceTemplatePath),
    resolve(basePath, outputPath),
    variableReplacements,
    overwrite,
    spinner,
  );
}
