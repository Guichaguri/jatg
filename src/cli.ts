#!/usr/bin/env node

import { Command, Option } from 'commander';
import ora from 'ora';
import { loadConfig } from './utils/loadConfig.js';
import { pickTemplate } from './utils/pickTemplate.js';
import { promptVariables } from './utils/promptVariables.js';
import { processTemplate } from './processTemplate.js';
import { initConfig } from './utils/initConfig.js';
import { showError } from './utils/showError.js';
import { JatgError } from './models/jatg-error.js';

const program = new Command();

program
  .name('jatg')
  .description('Generate files from templates')
  .version('1.1.0')
  .showHelpAfterError()
  .addOption(
    new Option('--init', 'creates the configuration file')
  )
  .addOption(
    new Option('-b, --base-path [path]', 'base path')
      .env('JATG_BASE_PATH')
      .default('./')
  )
  .addOption(
    new Option('-c, --templates-config <path>', 'templates config file path')
      .env('JATG_TEMPLATE_CONFIG_PATH')
      .default('./templates.json')
  )
  .addOption(
    new Option('-t, --template [template]', 'template name')
  )
  .addOption(
    new Option('-o, --overwrite', 'overwrite files')
  )
  .action((opts) => runCli(opts).catch(error => showError(error)));

program.parse();

async function runCli(opts: Record<string, any>): Promise<void> {
  if (opts.init) {
    await initConfig(opts.templatesConfig, opts.basePath, opts.overwrite, opts.template);
  } else {
    await generate(opts.templatesConfig, opts.basePath, opts.overwrite, opts.template);
  }
}

async function generate(configPath: string, basePath: string, overwrite: boolean, templateName?: string): Promise<void> {
  const config = await loadConfig(basePath, configPath);

  const templates = config.templates || [];
  const composites = config.composites || [];

  const pickedTemplates = await pickTemplate(templates, composites, templateName);

  if (pickedTemplates.length === 0)
    throw new JatgError(`No templates found for "${templateName}"`);

  const variables = await promptVariables(pickedTemplates);

  const spinner = ora('Starting...');

  try {
    await processTemplate(pickedTemplates, variables, overwrite, basePath, spinner);

    spinner?.succeed('Success!');
    console.log();
  } catch (error) {
    showError(error, spinner);
  }
}
