import prompts from 'prompts';
import ora from 'ora';
import chalk from 'chalk';
import { capitalCase } from 'change-case';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, relative, resolve } from 'node:path';
import { loadConfig } from '../utils/loadConfig.js';
import { showError } from '../utils/showError.js';
import { TemplateConfiguration, TemplateModel } from '../models/template.model.js';
import { JatgError } from '../models/jatg-error.js';
import { convertTemplate } from './convertTemplate.js';

const initialConfig: TemplateConfiguration & { $schema: string } = {
  $schema: 'https://unpkg.com/jatg/templates.schema.json',
  templates: [],
};

export async function runInit(configPath: string, basePath: string, overwrite?: boolean, template?: string): Promise<void> {
  console.log(chalk.magentaBright('jatg') + ' - create a new template wizard');
  console.log();

  let config: TemplateConfiguration = { ...initialConfig };

  if (!overwrite)
    config = await loadConfig(basePath, configPath).catch(() => config);

  console.log(chalk.yellow('What name best describes the template?'));

  const { name } = await prompts({
    name: 'name',
    type: 'text',
    message: 'Template Name',
    initial: template || 'my-cool-template',
    validate: value => !value ? 'The name cannot be empty' : true,
  }, {
    onCancel: () => { throw new JatgError('Operation canceled'); }
  });

  if (config.templates.some(t => t.name === name))
    throw new JatgError(`There's already a template named "${name}"`);

  if (config.composites && config.composites.some(t => t.name === name))
    throw new JatgError(`There's already a composite named "${name}"`);

  console.log();
  console.log(chalk.yellow('What is the variable name that you want to use in your template files?'));
  console.log(chalk.yellow(`Leave empty if you don't want to define a variable.`));

  const { variable } = await prompts({
    name: 'variable',
    type: 'text',
    message: 'Variable',
  }, {
    onCancel: () => { throw new JatgError('Operation canceled'); }
  });

  console.log();
  console.log(chalk.yellow('Choose a path where the template files will be located.'));
  console.log(chalk.yellow('This can be the path to a specific template file or to a directory containing template files.'));

  const { sourcePath } = await prompts({
    name: 'sourcePath',
    type: 'text',
    message: 'Template Path',
    initial: './templates',
    validate: value => !value ? 'The path cannot be empty' : true,
  }, {
    onCancel: () => { throw new JatgError('Operation canceled'); }
  });

  console.log();
  console.log(chalk.yellow('Now, choose a directory that the files should be generated into.'));
  console.log(chalk.yellow('This path can also contain variables.'));

  const { outputPath } = await prompts({
    name: 'outputPath',
    type: 'text',
    message: 'Output Path',
    initial: './src',
    validate: value => !value ? 'The path cannot be empty' : true,
  }, {
    onCancel: () => { throw new JatgError('Operation canceled'); }
  });

  console.log();

  const spinner = ora('Preparing...');

  try {
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

    config.templates.push(template);

    spinner.start('Saving...');

    const configFullPath = resolve(basePath, configPath);

    await mkdir(dirname(configFullPath), { recursive: true });
    await writeFile(configFullPath, JSON.stringify(config, null, 2));

    spinner.succeed('Saved at ' + relative('./', configFullPath));

    console.log();
    console.log(chalk.cyanBright(`Now, you can create a template file containing everything you need to be automatically generated.`));

    if (variable)
      console.log(chalk.cyanBright(`The variable should be formatted as `) + chalk.cyan(`%${ variable.toString().trim() }%`));

    console.log();
    console.log(chalk.cyanBright('Once the template is ready, you can generate files by running ') + chalk.cyan('jatg'));
    console.log();
    console.log(chalk.cyanBright('You can also change or extend these settings anytime by editting ') + chalk.cyan(relative('./', configFullPath)));
    console.log();

    if (variable) {
      console.log(chalk.yellow('Do you want to also generate the template files?'));
      console.log(chalk.yellow('You only need to provide an existing path containing your files and a variable needle.'));
      console.log(chalk.yellow('Those files will be converted into a template with the needle being replaced to', chalk.cyan(`%${ variable.toString().trim() }%`)));
      console.log();

      const { generateTemplateFiles } = await prompts({
        name: 'generateTemplateFiles',
        type: 'toggle',
        message: 'Generate template files?',
        initial: true,
      }, {
        onCancel: () => {
          throw new JatgError('Operation canceled');
        }
      });

      if (generateTemplateFiles) {
        await convertTemplate([{ variable: variable.toString().trim() }], outputPath, false, spinner);

        console.log();
      }
    }

    console.log(chalk.gray('Run this command again to generate another template'));
    console.log();
  } catch (error) {
    showError(error, spinner);
  }
}
