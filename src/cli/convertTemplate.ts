import { resolve } from 'node:path';
import prompts from 'prompts';
import type { Ora } from 'ora';
import { convertFileIntoTemplate } from '../utils/convertFileIntoTemplate.js';
import { JatgError } from '../models/jatg-error.js';
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

  const { sourceTemplatePath } = await prompts([
    {
      name: 'sourceTemplatePath',
      type: 'text',
      message: 'What is the path where the files that will be converted are?',
    },
  ], {
    onCancel: () => {
      throw new JatgError('Operation canceled');
    }
  });

  if (!sourceTemplatePath) {
    return;
  }

  const variableReplacements: TemplateVariableReplacement[] = [];

  for (const item of variables) {
    const { needle } = await prompts([
      {
        name: 'needle',
        type: 'text',
        message: 'What string will be replaced to %' + item.variable + '%?',
        initial: item.variable,
      }
    ], {
      onCancel: () => {
        throw new JatgError('Operation canceled');
      }
    });

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
