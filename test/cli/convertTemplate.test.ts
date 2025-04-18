import { beforeEach, describe, expect, it, vi } from 'vitest';
import { convertTemplate } from '../../src/cli/convertTemplate.js';
import { convertFileIntoTemplate } from '../../src/utils/convertFileIntoTemplate.js';
import { prompt } from '../../src/utils/prompt.js';
import { resolve } from 'node:path';

vi.mock('../../src/utils/prompt.js', () => ({
  prompt: vi.fn(),
}));
vi.mock('../../src/utils/convertFileIntoTemplate.js', () => ({
  convertFileIntoTemplate: vi.fn(),
}));

describe('convertTemplate', () => {
  const promptMocked = vi.mocked(prompt);
  const convertFileIntoTemplateMocked = vi.mocked(convertFileIntoTemplate);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should prompt all variables and convert the file into a template', async () => {
    promptMocked
      .mockResolvedValueOnce({ sourceTemplatePath: './src/entities' })
      .mockResolvedValueOnce({ needle: 'User' });

    await convertTemplate(
      [
        {
          variable: 'name',
        },
      ],
      './templates',
      './base',
    );

    expect(convertFileIntoTemplateMocked).toHaveBeenCalledWith(
      resolve('./base', './src/entities'),
      resolve('./base', './templates'),
      [
        {
          variable: 'name',
          needle: 'User',
        },
      ],
      undefined,
      undefined,
    );
  });

  it('should do nothing if the template has no variables', async () => {
    await convertTemplate(
      [],
      './templates',
      './base',
      false,
      {} as any,
    );

    expect(promptMocked).not.toHaveBeenCalled();
    expect(convertFileIntoTemplateMocked).not.toHaveBeenCalled();
  });

  it('should validate the source template path', async () => {
    promptMocked
      .mockImplementationOnce(async (prompts) => {
        const prompt = (prompts as any)[0];

        expect(prompt.validate('', {}, prompt)).toBeTypeOf('string');
        expect(prompt.validate('./src/entities', {}, prompt)).toBe(true);

        return { sourceTemplatePath: './src/entities' };
      })
      .mockResolvedValueOnce({ needle: 'User' });

    const spinner: any = {};

    await convertTemplate(
      [
        {
          variable: 'name',
        },
      ],
      './templates',
      './',
      true,
      spinner,
    );

    expect(convertFileIntoTemplateMocked).toHaveBeenCalledWith(
      resolve('./', './src/entities'),
      resolve('./', './templates'),
      [
        {
          variable: 'name',
          needle: 'User',
        },
      ],
      true,
      spinner,
    );
  });
});
