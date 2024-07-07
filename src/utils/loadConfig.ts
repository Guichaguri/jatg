import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { TemplateConfiguration } from '../models/template.model.js';

export async function loadConfig(basePath: string, path: string): Promise<TemplateConfiguration> {
  try {
    const rawConfig = await readFile(resolve(basePath, path), 'utf8');

    return JSON.parse(rawConfig);
  } catch (error) {
    throw new Error(`Couldn't open the config file ${path}`);
  }
}
