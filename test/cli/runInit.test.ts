import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import ora from 'ora';
import { runInit } from '../../src/cli/runInit.js';
import { loadConfig } from '../../src/utils/loadConfig.js';
import { prompt } from '../../src/utils/prompt.js';
import { showError } from '../../src/utils/showError.js';
import { convertTemplate } from '../../src/cli/convertTemplate.js';
import { JatgError } from '../../src/models/jatg-error.js';

vi.mock('../../src/utils/loadConfig.js', () => ({
  loadConfig: vi.fn(),
}));

vi.mock('../../src/utils/prompt.js', () => ({
  prompt: vi.fn(),
}));

vi.mock('../../src/utils/showError.js', () => ({
  showError: vi.fn(),
}));

vi.mock('../../src/cli/convertTemplate.js', () => ({
  convertTemplate: vi.fn(),
}));

vi.mock('node:fs/promises', () => ({
  mkdir: vi.fn(),
  writeFile: vi.fn(),
}));

vi.mock('ora', () => ({
  default: vi.fn().mockReturnValue({
    start: vi.fn().mockReturnThis(),
    stop: vi.fn().mockReturnThis(),
    succeed: vi.fn().mockReturnThis(),
  }),
}));

const loadConfigMock = vi.mocked(loadConfig);
const promptMocked = vi.mocked(prompt);

describe('runInit', () => {
  const mockSpinner = {
    start: vi.fn().mockReturnThis(),
    stop: vi.fn().mockReturnThis(),
    succeed: vi.fn().mockReturnThis(),
  };

  vi.mocked(ora).mockReturnValue(mockSpinner as any);
  vi.spyOn(console, 'log').mockImplementation(() => {});

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a new template when no config exists', async () => {
    loadConfigMock.mockRejectedValueOnce(new Error('Config not found'));

    promptMocked
      .mockResolvedValueOnce({ name: 'new-template' })
      .mockResolvedValueOnce({ variable: 'component' })
      .mockResolvedValueOnce({ sourcePath: './templates' })
      .mockResolvedValueOnce({ outputPath: './src' })
      .mockResolvedValueOnce({ generateTemplateFiles: false });

    await runInit('config.json', './base');

    expect(loadConfigMock).toHaveBeenCalledWith('./base', 'config.json');
    expect(mkdir).toHaveBeenCalled();
    expect(writeFile).toHaveBeenCalledWith(
      resolve('./base', 'config.json'),
      expect.stringContaining('"name": "new-template"')
    );
  });

  it('should add a template to existing config', async () => {
    const existingConfig = {
      templates: [{ name: 'existing-template', sourcePaths: [], outputPath: '', variables: [] }],
    };
    loadConfigMock.mockResolvedValueOnce(existingConfig);

    promptMocked
      .mockResolvedValueOnce({ name: 'new-template' })
      .mockResolvedValueOnce({ variable: '' })
      .mockResolvedValueOnce({ sourcePath: './templates' })
      .mockResolvedValueOnce({ outputPath: './src' });

    await runInit('config.json', './base');

    expect(writeFile).toHaveBeenCalledWith(
      resolve('./base', 'config.json'),
      expect.stringContaining('"name": "new-template"')
    );

    expect(writeFile).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringContaining('"name": "existing-template"')
    );
  });

  it('should throw an error when a template with the same name exists', async () => {
    const existingConfig = {
      templates: [{ name: 'duplicate', sourcePaths: [], outputPath: '', variables: [] }],
    };
    loadConfigMock.mockResolvedValueOnce(existingConfig);

    promptMocked.mockResolvedValueOnce({ name: 'duplicate' });

    await expect(runInit('config.json', './base'))
      .rejects.toThrow(new JatgError('There\'s already a template named "duplicate"'));

    expect(writeFile).not.toHaveBeenCalled();
  });

  it('should throw an error when a composite with the same name exists', async () => {
    const existingConfig = {
      templates: [],
      composites: [{ name: 'duplicate', templates: [] }]
    };
    loadConfigMock.mockResolvedValueOnce(existingConfig);

    promptMocked.mockResolvedValueOnce({ name: 'duplicate' });

    await expect(runInit('config.json', './base'))
      .rejects.toThrow(new JatgError('There\'s already a composite named "duplicate"'));

    expect(writeFile).not.toHaveBeenCalled();
  });

  it('should convert template files when user chooses to', async () => {
    loadConfigMock.mockRejectedValueOnce(new Error('Config not found'));

    promptMocked
      .mockResolvedValueOnce({ name: 'sample' })
      .mockResolvedValueOnce({ variable: 'component' })
      .mockResolvedValueOnce({ sourcePath: './templates' })
      .mockResolvedValueOnce({ outputPath: './src' })
      .mockResolvedValueOnce({ generateTemplateFiles: true });

    await runInit('config.json', './base');

    expect(convertTemplate).toHaveBeenCalledWith(
      [{ variable: 'component' }],
      './templates',
      './base',
      false,
      mockSpinner
    );
  });

  it('should use provided template name as initial value', async () => {
    loadConfigMock.mockRejectedValueOnce(new Error('Config not found'));

    promptMocked
      .mockResolvedValueOnce({ name: 'provided-template' })
      .mockResolvedValueOnce({ variable: '' })
      .mockResolvedValueOnce({ sourcePath: './templates' })
      .mockResolvedValueOnce({ outputPath: './src' });

    await runInit('config.json', './base', false, 'provided-template');

    expect(promptMocked).toHaveBeenCalledWith(expect.objectContaining({
      initial: 'provided-template',
    }));
  });

  it('should handle errors during execution', async () => {
    loadConfigMock.mockRejectedValueOnce(new Error('Config not found'));

    promptMocked
      .mockResolvedValueOnce({ name: 'something' })
      .mockResolvedValueOnce({ variable: '' })
      .mockResolvedValueOnce({ sourcePath: './templates' })
      .mockResolvedValueOnce({ outputPath: './src' });

    const mockError = new Error('Failed to save');
    vi.mocked(writeFile).mockRejectedValue(mockError);

    await runInit('config.json', './base');

    expect(showError).toHaveBeenCalledWith(mockError, mockSpinner);
    expect(mockSpinner.succeed).not.toHaveBeenCalled();
  });

  it('should validate all prompts', async () => {
    loadConfigMock.mockRejectedValueOnce(new Error('Config not found'));

    promptMocked
      .mockImplementation(async options => {
        const prompts = Array.isArray(options) ? options : [options];

        for (const prompt of prompts) {
          if (prompt.validate) {
            expect(prompt.validate('', {}, prompt)).toBeTypeOf('string');
            expect(prompt.validate('teste', {}, prompt)).toBe(true);
          }
        }

        return { name: 'sample', variable: '', sourcePath: './path/to', outputPath: './' };
      });

    const mockError = new Error('Failed');
    vi.mocked(mkdir).mockRejectedValue(mockError);

    await runInit('config.json', './base');

    expect(showError).toHaveBeenCalledWith(mockError, mockSpinner);
    expect(mockSpinner.succeed).not.toHaveBeenCalled();
  });
});
