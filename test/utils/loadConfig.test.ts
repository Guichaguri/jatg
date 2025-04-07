import { expect, test, vi } from 'vitest';
import { readFile } from 'node:fs/promises';
import { loadConfig } from '../../src/utils/loadConfig.js';
import { TemplateConfiguration } from '../../src/models/template.model.js';
import { resolve } from 'node:path';
import { JatgError } from '../../src/models/jatg-error.js';

vi.mock('node:fs/promises', async () => ({
  readFile: vi.fn<() => Promise<string>>(),
}));

const readFileMock = vi.mocked(readFile);

const sampleConfig: Partial<TemplateConfiguration> = { templates: [] };

test('load config successful', async () => {
  readFileMock.mockClear().mockResolvedValueOnce(JSON.stringify(sampleConfig));

  const config = await loadConfig('./sample', './templates.json');

  expect(readFileMock).toHaveBeenCalledWith(resolve('./sample', './templates.json'), 'utf8');
  expect(config).toStrictEqual(sampleConfig);
});

test('invalid json', async () => {
  readFileMock.mockClear().mockResolvedValueOnce('{');

  await expect(loadConfig('./', './templates.json')).rejects.toBeInstanceOf(JatgError);
});

test('file not found', async () => {
  const error: NodeJS.ErrnoException = new Error('File not found');
  error.code = 'ENOENT';

  readFileMock.mockClear().mockRejectedValueOnce(error);

  await expect(loadConfig('./', './templates.json')).rejects.toBeInstanceOf(JatgError);
});

test('unexpected error', async () => {
  const error = new Error('Unexpected');

  readFileMock.mockClear().mockRejectedValueOnce(error);

  await expect(loadConfig('./', './templates.json')).rejects.toBe(error);
});
