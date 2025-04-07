import { beforeEach, expect, test, vi } from 'vitest';
import { join } from 'node:path';
import { readFile } from 'node:fs/promises';
import { processTemplateFile } from '../../src/utils/processTemplateFile.js';
import { saveFile } from '../../src/utils/listAllFiles.js';
import { TemplateModel } from '../../src/models/template.model.js';

vi.mock('node:fs/promises', async () => ({
  readFile: vi.fn<() => Promise<string>>(),
}));

vi.mock('../../src/utils/listAllFiles.js', async () => ({
  saveFile: vi.fn<() => Promise<void>>(),
}));

const readFileMock = vi.mocked(readFile);
const saveFileMock = vi.mocked(saveFile);

const template: TemplateModel = {
  name: 'Test',
  outputPath: './src',
  sourcePaths: ['./templates/test'],
  variables: [
    { variable: 'name' },
  ],
};

const variables = new Map([
  ['name', 'User'],
]);

const ora: any = {
  start: vi.fn(),
  succeed: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
});

test('process template file', async () => {
  readFileMock.mockResolvedValue('Sample %name%!');
  saveFileMock.mockResolvedValue();

  const outputPath = await processTemplateFile(
    template,
    variables,
    './templates/test/file.txt',
    './',
    './src/file.txt',
    false,
  );

  expect(readFileMock).toHaveBeenCalledWith('./templates/test/file.txt', 'utf8');
  expect(saveFileMock).toHaveBeenCalledWith(outputPath, 'Sample User!', false);
  expect(outputPath).toBe(join('./', './src/file.txt'));
});

test('process template file with .template extension', async () => {
  readFileMock.mockResolvedValue('Sample %name%!');
  saveFileMock.mockResolvedValue();

  const outputPath = await processTemplateFile(
    template,
    variables,
    './templates/test/%name%.txt.template',
    './base',
    './src/%name%.txt.template',
    true,
    ora,
  );

  expect(readFileMock).toHaveBeenCalledWith('./templates/test/%name%.txt.template', 'utf8');
  expect(saveFileMock).toHaveBeenCalledWith(outputPath, 'Sample User!', true);
  expect(outputPath).toBe(join('./base', './src/User.txt'));
  expect(ora.start).toHaveBeenCalledWith('./src/User.txt');
  expect(ora.succeed).toHaveBeenCalledWith('./src/User.txt');
});
