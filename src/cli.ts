#!/usr/bin/env node

import { Command, Option } from 'commander';
import ora from 'ora';
import { loadConfig } from './utils/loadConfig.js';
import { pickTemplate } from './utils/pickTemplate.js';
import { promptVariables } from './utils/promptVariables.js';
import { processTemplate } from './processTemplate.js';
import { initConfig } from './utils/initConfig.js';

const program = new Command();

program
  .name('jatg')
  .description('Generate files from templates')
  .version('0.0.3')
  .showHelpAfterError()
  .addOption(
    new Option('--init', 'creates the configuration file')
      .default(false)
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
    new Option('-b, --base-path [path]', 'base path')
      .env('JATG_BASE_PATH')
      .default('./')
  )
  .addOption(
    new Option('-o, --overwrite', 'overwrite files')
      .default(false)
  )
  .action((opts) => {
    if (opts.init) {
      initConfig(opts.templatesConfig, opts.basePath, opts.overwrite, opts.template)
        .catch((error) => console.error(error?.toString()));

      return;
    }

    runCli(opts.templatesConfig, opts.basePath, opts.overwrite, opts.template)
      .then(() => console.log('Done.'))
      .catch((error) => console.error(error?.toString()));
  })

program.parse();

async function runCli(configPath: string, basePath: string, overwrite: boolean, templateName?: string): Promise<void> {
  const config = await loadConfig(basePath, configPath);

  const templates = config.templates || [];
  const composites = config.composites || [];

  const pickedTemplates = await pickTemplate(templates, composites, templateName);

  if (pickedTemplates.length === 0)
    throw new Error(`No templates found for ${templateName}`);

  const variables = await promptVariables(pickedTemplates);

  const spinner = ora('Starting...');

  try {
    await processTemplate(pickedTemplates, variables, overwrite, basePath, spinner);

    spinner?.succeed('Success!');
  } catch (error) {
    spinner?.fail((error as Error)?.message || error?.toString() || 'Failed');

    console.error(error);
  }
}
