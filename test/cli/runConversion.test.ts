import { describe, it, expect, vi, beforeEach } from 'vitest';
import { runConversion } from '../../src/cli/runConversion.js';
import { loadConfig } from '../../src/utils/loadConfig.js';
import { prompt } from '../../src/utils/prompt.js';
import { pickTemplate } from '../../src/cli/pickTemplate.js';
import { convertTemplate } from '../../src/cli/convertTemplate.js';
import ora from 'ora';
import { JatgError } from '../../src/models/jatg-error.js';

vi.mock('../../src/utils/loadConfig.js', () => ({
  loadConfig: vi.fn(),
}));

vi.mock('../../src/utils/prompt.js', () => ({
  prompt: vi.fn(),
}));

vi.mock('../../src/cli/pickTemplate.js', () => ({
  pickTemplate: vi.fn(),
}));

vi.mock('../../src/cli/convertTemplate.js', () => ({
  convertTemplate: vi.fn(),
}));

vi.mock('ora', () => ({
  default: vi.fn().mockReturnValue({
    start: vi.fn().mockReturnThis(),
    stop: vi.fn().mockReturnThis(),
  }),
}));

vi.mock('chalk', () => ({
  default: {
    magentaBright: (text: string) => text,
    yellow: (text: string) => text,
  },
}));

describe('runConversion', () => {
  const mockSpinner = {
    start: vi.fn().mockReturnThis(),
    stop: vi.fn().mockReturnThis(),
  };

  beforeEach(() => {
    vi.resetAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => {});

    vi.mocked(ora).mockReturnValue(mockSpinner as any);
    vi.mocked(prompt).mockResolvedValue({ outputPath: './output' });
  });

  it('should load config and use picked template for conversion', async () => {
    const mockTemplate = {
      name: 'test',
      sourcePaths: ['./src/file.ts'],
      outputPath: '',
      variables: [{ variable: 'name', name: 'Name' }],
    };

    vi.mocked(loadConfig).mockResolvedValue({ templates: [mockTemplate] });
    vi.mocked(pickTemplate).mockResolvedValue([mockTemplate]);

    await runConversion('config.json', './base', false, 'test');

    expect(loadConfig).toHaveBeenCalledWith('./base', 'config.json');
    expect(pickTemplate).toHaveBeenCalledWith([mockTemplate], [], 'test');
    expect(prompt).toHaveBeenCalledWith([
      expect.objectContaining({
        name: 'outputPath',
        initial: './src',
      }),
    ]);
    expect(convertTemplate).toHaveBeenCalledWith(
      mockTemplate.variables,
      './output',
      './base',
      false,
      mockSpinner
    );
  });

  it('should throw error when no templates are found', async () => {
    vi.mocked(loadConfig).mockResolvedValue({ } as any);
    vi.mocked(pickTemplate).mockResolvedValue([]);

    await expect(runConversion('config.json', './base', false))
      .rejects
      .toThrow(new JatgError('No templates found'));

    expect(convertTemplate).not.toHaveBeenCalled();
  });

  it('should use first template when multiple are picked', async () => {
    const mockTemplates = [
      {
        name: 'test1',
        sourcePaths: ['./src/path'],
        outputPath: '',
        variables: [{ variable: 'name', name: 'Name' }],
      },
      {
        name: 'test2',
        sourcePaths: ['./src/file2.ts'],
        outputPath: '',
        variables: [{ variable: 'other', name: 'Other' }],
      }
    ];

    vi.mocked(loadConfig).mockResolvedValue({ templates: mockTemplates });
    vi.mocked(pickTemplate).mockResolvedValue(mockTemplates);

    await runConversion('config.json', './base', true);

    expect(convertTemplate).toHaveBeenCalledWith(
      mockTemplates[0].variables,
      './output',
      './base',
      true,
      mockSpinner
    );
  });

  it('should use default output path when template has no sourcePaths', async () => {
    const mockTemplate = {
      name: 'test',
      sourcePaths: [],
      outputPath: '',
      variables: [],
    };

    vi.mocked(loadConfig).mockResolvedValue({ templates: [mockTemplate] });
    vi.mocked(pickTemplate).mockResolvedValue([mockTemplate]);

    await runConversion('config.json', './base');

    expect(prompt).toHaveBeenCalledWith([
      expect.objectContaining({
        name: 'outputPath',
        initial: './templates',
      }),
    ]);
  });
});
