#!/usr/bin/env node

import { Command, Option } from 'commander';
import { runInit } from './cli/runInit.js';
import { runConversion } from './cli/runConversion.js';
import { runGeneration } from './cli/runGeneration.js';
import { showError } from './utils/showError.js';

const program = new Command();

program
  .name('jatg')
  .description('Generate files from templates')
  .version('1.3.1')
  .showHelpAfterError()
  .addOption(
    new Option('--init', 'creates the configuration file')
  )
  .addOption(
    new Option('--convert', 'converts files into templates')
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
      .env('JATG_TEMPLATE_NAME')
  )
  .addOption(
    new Option('-o, --overwrite', 'overwrite files')
  )
  .action((opts) => runCli(opts).catch(error => showError(error)));

program.parse();

async function runCli(opts: Record<string, any>): Promise<void> {
  if (opts.init) {
    await runInit(opts.templatesConfig, opts.basePath, opts.overwrite, opts.template);
  } else if (opts.convert) {
    await runConversion(opts.templatesConfig, opts.basePath, opts.overwrite, opts.template);
  } else {
    await runGeneration(opts.templatesConfig, opts.basePath, opts.overwrite, opts.template);
  }
}
