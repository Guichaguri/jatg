import { dirname, extname } from 'node:path';
import chalk from 'chalk';
import ora from 'ora';
import prompts from 'prompts';
import { loadConfig } from '../utils/loadConfig.js';
import { JatgError } from '../models/jatg-error.js';
import { convertTemplate } from './convertTemplate.js';
import { pickTemplate } from './pickTemplate.js';

export async function runConversion(
  configPath: string,
  basePath: string,
  overwrite?: boolean,
  templateName?: string,
): Promise<void> {
  console.log(chalk.magentaBright('jatg') + ' - convert files into templates');
  console.log();

  const spinner = ora('Preparing...');

  const config = await loadConfig(basePath, configPath);

  spinner.stop();

  const templates = config.templates || [];

  const pickedTemplates = await pickTemplate(templates, [], templateName);

  if (pickedTemplates.length === 0)
    throw new JatgError(`No templates found`);

  const template = pickedTemplates[0];

  console.log();
  console.log(chalk.yellow(`We'll convert these files into template files, replacing a search string into a variable.`));
  console.log();

  const outputPathSuggestions = template.sourcePaths
    .map(path => extname(path) ? dirname(path) : path);

  const { outputPath } = await prompts([
    {
      name: 'outputPath',
      type: 'text',
      message: 'What is the output path where the template files will be generated?',
      initial: outputPathSuggestions.length > 0 ? outputPathSuggestions[0] : './templates',
    },
  ], {
    onCancel: () => {
      throw new JatgError('Operation canceled');
    }
  });

  await convertTemplate(template.variables, outputPath, overwrite, spinner);
}
