import { beforeEach, expect, test, vi } from 'vitest';
import { readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { listAllFiles, saveFile } from '../../src/utils/listAllFiles.js';
import { convertFileIntoTemplate } from '../../src/utils/convertFileIntoTemplate.js';
import { TemplateVariableReplacement } from '../../src/models/template.model.js';

vi.mock('node:fs/promises', () => ({
  readFile: vi.fn(),
}));

vi.mock('../../src/utils/listAllFiles.js', () => ({
  listAllFiles: vi.fn(),
  saveFile: vi.fn(),
}));

vi.mock('../../src/utils/showError.js', () => ({
  showError: vi.fn(),
}));

const readFileMock = vi.mocked(readFile);
const listAllFilesMock = vi.mocked(listAllFiles);
const saveFileMock = vi.mocked(saveFile);

const variables: TemplateVariableReplacement[] = [
  { variable: 'name', needle: 'World' },
  { variable: 'title', needle: 'jatg' },
];

const ora: any = {
  start: vi.fn(),
  succeed: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
});

test('convert file into template', async () => {
  listAllFilesMock.mockResolvedValueOnce(['./', ['test.txt']]);
  readFileMock.mockResolvedValueOnce('Hello World from jatg!');
  saveFileMock.mockResolvedValueOnce();

  await convertFileIntoTemplate('./src', './templates', variables);

  expect(listAllFilesMock).toHaveBeenCalledWith('./src');
  expect(readFileMock).toHaveBeenCalledWith('test.txt', 'utf8');
  expect(saveFileMock).toHaveBeenCalledWith(
    join('./templates', relative('./', 'test.txt.template')),
    'Hello %name.singular.pascalCase% from %title.singular.camelCase%!',
    false,
  );
});

test('convert file into template with ora', async () => {
  listAllFilesMock.mockResolvedValueOnce(['./', ['test.txt']]);
  readFileMock.mockResolvedValueOnce('Hello World from jatg!');
  saveFileMock.mockResolvedValueOnce();

  await convertFileIntoTemplate('./src', './templates', variables, true, ora);

  expect(listAllFilesMock).toHaveBeenCalledWith('./src');
  expect(readFileMock).toHaveBeenCalledWith('test.txt', 'utf8');
  expect(saveFileMock).toHaveBeenCalledWith(
    join('./templates', relative('./', 'test.txt.template')),
    'Hello %name.singular.pascalCase% from %title.singular.camelCase%!',
    true,
  );
  expect(ora.start).toHaveBeenCalled();
  expect(ora.succeed).toHaveBeenCalled();
});


test('fail to convert file into template', async () => {
  listAllFilesMock.mockResolvedValueOnce(['./', ['test.txt']]);
  readFileMock.mockResolvedValueOnce('Hello World from jatg!');
  saveFileMock.mockRejectedValueOnce(new Error('Unexpected error'));

  await convertFileIntoTemplate('./src', './templates', variables, true, ora);

  expect(ora.start).toHaveBeenCalled();
  expect(ora.succeed).not.toHaveBeenCalled();
});
