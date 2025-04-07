import { lstat, mkdir, readdir, writeFile } from 'node:fs/promises';
import { dirname, relative, resolve } from 'node:path';
import { JatgError } from '../models/jatg-error.js';

async function listFiles(dir: string): Promise<string[]> {
  const dirents = await readdir(dir, { withFileTypes: true });

  const files = await Promise.all(dirents.map(dirent => {
    const path = resolve(dir, dirent.name);
    return dirent.isDirectory() ? listFiles(path) : [path];
  }));

  return files.flat();
}

/**
 * List all files in a directory
 *
 * @param inputPath The input file or directory
 * @returns [dirPath, files]
 */
export async function listAllFiles(inputPath: string): Promise<[string, string[]]> {
  const stat = await lstat(inputPath);

  if (stat.isFile())
    return [dirname(inputPath), [inputPath]];

  return [
    inputPath,
    await listFiles(inputPath),
  ];
}

export async function saveFile(outputPath: string, contents: string, overwrite: boolean): Promise<void> {
  try {
    await mkdir(dirname(outputPath), { recursive: true });
    await writeFile(outputPath, contents, {
      flag: overwrite ? 'w' : 'wx',
      encoding: 'utf8',
    });
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;

    if (code === 'EEXIST') {
      throw new JatgError(`The file "${relative('./', outputPath)}" already exists.`);
    }

    throw error;
  }
}
