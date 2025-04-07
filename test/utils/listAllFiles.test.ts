import { expect, test, vi } from 'vitest';
import { lstat, mkdir, readdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { listAllFiles, saveFile } from '../../src/utils/listAllFiles.js';
import { JatgError } from '../../src/models/jatg-error.js';

vi.mock('node:fs/promises', () => ({
  lstat: vi.fn(),
  mkdir: vi.fn(),
  readdir: vi.fn(),
  writeFile: vi.fn(),
}));

const lstatMock = vi.mocked(lstat);
const mkdirMock = vi.mocked(mkdir);
const readdirMock = vi.mocked(readdir);
const writeFileMock = vi.mocked(writeFile);

test('list a single file', async () => {
  lstatMock.mockResolvedValueOnce({ isFile: () => true } as any);

  const inputPath = './path/to/sample.txt';

  const [dir, input] = await listAllFiles(inputPath);

  expect(dir).toBe(dirname(inputPath));
  expect(input).toEqual([inputPath]);
  expect(lstatMock).toHaveBeenCalledWith(inputPath);
});

test('list directory files', async () => {
  lstatMock.mockResolvedValueOnce({ isFile: () => false } as any);
  readdirMock.mockResolvedValueOnce([
    { isDirectory: () => false, name: 'sample.txt' } as any,
    { isDirectory: () => true, name: 'data' } as any,
  ]);
  readdirMock.mockResolvedValueOnce([
    { isDirectory: () => false, name: 'sample2.txt' } as any,
  ]);

  const inputPath = './path/to';

  const [dir, input] = await listAllFiles(inputPath);

  expect(dir).toBe(inputPath);
  expect(input).toEqual([resolve(inputPath, 'sample.txt'), resolve(inputPath, 'data', 'sample2.txt')]);
  expect(lstatMock).toHaveBeenCalledWith(inputPath);
  expect(readdirMock).toHaveBeenCalledWith(inputPath, { withFileTypes: true });
  expect(readdirMock).toHaveBeenCalledWith(resolve(inputPath, 'data'), { withFileTypes: true });
});

test('save file', async () => {
  mkdirMock.mockResolvedValueOnce(undefined);
  writeFileMock.mockResolvedValueOnce();

  const outputPath = './output.txt';
  const contents = 'sample';

  await saveFile(outputPath, contents, false);

  expect(mkdirMock).toHaveBeenCalledWith(dirname(outputPath), { recursive: true });
  expect(writeFileMock).toHaveBeenCalledWith(outputPath, contents, {
    flag: 'wx',
    encoding: 'utf8',
  });
});

test('save file overwriting', async () => {
  mkdirMock.mockResolvedValueOnce(undefined);
  writeFileMock.mockResolvedValueOnce();

  const outputPath = './path/to/output.txt';
  const contents = 'hello world!';

  await saveFile(outputPath, contents, true);

  expect(mkdirMock).toHaveBeenCalledWith(dirname(outputPath), { recursive: true });
  expect(writeFileMock).toHaveBeenCalledWith(outputPath, contents, {
    flag: 'w',
    encoding: 'utf8',
  });
});

test('save already existing file', async () => {
  const error: NodeJS.ErrnoException = new Error('File already exists');
  error.code = 'EEXIST';

  mkdirMock.mockResolvedValueOnce(undefined);
  writeFileMock.mockRejectedValueOnce(error);

  await expect(saveFile('./output.txt', 'abcd', false)).rejects.toBeInstanceOf(JatgError);
});

test('save file with unexpected error', async () => {
  const error = new Error('Unexpected');

  mkdirMock.mockResolvedValueOnce(undefined);
  writeFileMock.mockRejectedValueOnce(error);

  await expect(saveFile('./output.txt', 'abcd', false)).rejects.toBe(error);
});
