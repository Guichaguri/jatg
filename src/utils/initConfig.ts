import prompts from 'prompts';
import ora from 'ora';
import { capitalCase } from 'change-case';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, relative, resolve } from 'node:path';
import { loadConfig } from './loadConfig.js';
import { TemplateConfiguration, TemplateModel } from '../models/template.model.js';
import { JatgError } from '../models/jatg-error.js';
import { showError } from './showError.js';

const initialConfig: TemplateConfiguration & { $schema: string } = {
  $schema: 'https://unpkg.com/jatg/templates.schema.json',
  templates: [],
};

export async function initConfig(configPath: string, basePath: string, overwrite?: boolean, template?: string): Promise<void> {
  console.log('jatg - create a new template wizard');
  console.log();

  const { name, sourcePath, outputPath, variable } = await prompts([
    {
      name: 'name',
      type: 'text',
      message: 'Template Name',
      initial: template || 'my-cool-template',
      validate: value => !value ? 'The name cannot be empty' : true,
    },
    {
      name: 'sourcePath',
      type: 'text',
      message: 'Template Path',
      initial: './templates',
      validate: value => !value ? 'The path cannot be empty' : true,
    },
    {
      name: 'outputPath',
      type: 'text',
      message: 'Output Path',
      initial: './src',
      validate: value => !value ? 'The path cannot be empty' : true,
    },
    {
      name: 'variable',
      type: 'text',
      message: 'Variable',
      initial: 'name',
      validate: value => !value ? 'The variable name cannot be empty' : true,
    },
  ], {
    onCancel: () => { throw new JatgError('Operation canceled'); }
  });

  const spinner = ora('Preparing...');

  try {
    let config: TemplateConfiguration = { ...initialConfig };

    if (!overwrite)
      config = await loadConfig(basePath, configPath).catch(() => config);

    const template: TemplateModel = {
      name: name.toString(),
      sourcePaths: [sourcePath.toString()],
      outputPath: outputPath.toString(),
      variables: [],
    };

    if (variable) {
      template.variables.push({
        variable: variable.toString().trim(),
        name: capitalCase(variable.toString()),
      });
    }

    if (config.templates.some(t => t.name === template.name))
      throw new JatgError(`There's already a template named "${template.name}"`);

    if (config.composites && config.composites.some(t => t.name === template.name))
      throw new JatgError(`There's already a composite named "${template.name}"`);

    config.templates.push(template);

    spinner.start('Saving...');

    const configFullPath = resolve(basePath, configPath);

    await mkdir(dirname(configFullPath), { recursive: true });
    await writeFile(configFullPath, JSON.stringify(config, null, 2));

    spinner.succeed('Saved at ' + relative('./', configFullPath));
  } catch (error) {
    showError(error, spinner);
  }
}
