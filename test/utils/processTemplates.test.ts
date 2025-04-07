import { expect, test, vi } from 'vitest';
import { join, relative, resolve } from 'node:path';
import { processTemplates } from '../../src/utils/processTemplates.js';
import { processTemplateFile } from '../../src/utils/processTemplateFile.js';
import { listAllFiles } from '../../src/utils/listAllFiles.js';
import { TemplateModel } from '../../src/models/template.model.js';

vi.mock('../../src/utils/processTemplateFile.js', () => ({
  processTemplateFile: vi.fn(),
}));

vi.mock('../../src/utils/listAllFiles.js', () => ({
  listAllFiles: vi.fn(),
}));

const listAllFilesMock = vi.mocked(listAllFiles);
const processTemplateFileMock = vi.mocked(processTemplateFile);

const template: TemplateModel = {
  name: 'Test',
  sourcePaths: ['./templates'],
  outputPath: './src',
  variables: [{ variable: 'title' }],
};

const variables = new Map([
  ['title', 'Hello World'],
]);

const ora: any = {
  start: vi.fn(),
};

test('process templates', async () => {
  listAllFilesMock.mockResolvedValue(['./dir', ['test.txt', 'test2.txt']]);
  processTemplateFileMock.mockResolvedValue('');

  await processTemplates(
    [template],
    variables,
  );

  expect(listAllFilesMock).toHaveBeenCalledWith(resolve('./', './templates'));
  expect(processTemplateFileMock).toHaveBeenCalledWith(template, variables, 'test.txt', './', join('./src', relative('./dir', 'test.txt')), false, undefined);
  expect(processTemplateFileMock).toHaveBeenCalledWith(template, variables, 'test2.txt', './', join('./src', relative('./dir', 'test2.txt')), false, undefined);
});

test('process templates with ora', async () => {
  listAllFilesMock.mockResolvedValue(['./dir', ['sample.txt', 'sample2.txt']]);
  processTemplateFileMock.mockResolvedValue('');

  await processTemplates(
    [template],
    variables,
    true,
    './base',
    ora,
  );

  expect(listAllFilesMock).toHaveBeenCalledWith(resolve('./base', './templates'));
  expect(processTemplateFileMock).toHaveBeenCalledWith(template, variables, 'sample.txt', './base', join('./src', relative('./dir', 'sample.txt')), true, ora);
  expect(processTemplateFileMock).toHaveBeenCalledWith(template, variables, 'sample2.txt', './base', join('./src', relative('./dir', 'sample2.txt')), true, ora);
  expect(ora.start).toHaveBeenCalled();
});
