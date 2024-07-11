import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { TemplateConfiguration } from '../models/template.model.js';
import { JatgError } from '../models/jatg-error.js';

export async function loadConfig(basePath: string, path: string): Promise<TemplateConfiguration> {
  try {
    const rawConfig = await readFile(resolve(basePath, path), 'utf8');

    const config: Partial<TemplateConfiguration> = JSON.parse(rawConfig);

    return {
      templates: [],
      ...config,
    };
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new JatgError(`The config file ${path} has invalid JSON: ${error.message}`);
    }

    const code = (error as NodeJS.ErrnoException).code;

    if (code === 'ENOENT') {
      throw new JatgError(`The config file ${path} does not exist. Create one with "jatg --init"`);
    }

    throw error;
  }
}
