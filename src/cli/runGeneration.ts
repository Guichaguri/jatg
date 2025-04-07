import ora from 'ora';
import { JatgError } from '../models/jatg-error.js';
import { loadConfig } from '../utils/loadConfig.js';
import { processTemplates } from '../utils/processTemplates.js';
import { showError } from '../utils/showError.js';
import { promptVariables } from './promptVariables.js';
import { pickTemplate } from './pickTemplate.js';

export async function runGeneration(configPath: string, basePath: string, overwrite: boolean, templateName?: string): Promise<void> {
  const config = await loadConfig(basePath, configPath);

  const templates = config.templates || [];
  const composites = config.composites || [];

  const pickedTemplates = await pickTemplate(templates, composites, templateName);

  if (pickedTemplates.length === 0)
    throw new JatgError(`No templates found`);

  const variables = await promptVariables(pickedTemplates);

  const spinner = ora('Starting...');

  try {
    await processTemplates(pickedTemplates, variables, overwrite, basePath, spinner);

    spinner?.succeed('Success!');
    console.log();
  } catch (error) {
    showError(error, spinner);
  }
}
