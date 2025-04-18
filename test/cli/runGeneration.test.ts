import { describe, it, expect, vi, beforeEach } from 'vitest';
import { runGeneration } from '../../src/cli/runGeneration.js';
import { loadConfig } from '../../src/utils/loadConfig.js';
import { processTemplates } from '../../src/utils/processTemplates.js';
import { promptVariables } from '../../src/cli/promptVariables.js';
import { pickTemplate } from '../../src/cli/pickTemplate.js';
import { showError } from '../../src/utils/showError.js';
import ora from 'ora';
import { JatgError } from '../../src/models/jatg-error.js';

vi.mock('../../src/utils/loadConfig.js', () => ({
  loadConfig: vi.fn(),
}));

vi.mock('../../src/utils/processTemplates.js', () => ({
  processTemplates: vi.fn(),
}));

vi.mock('../../src/cli/promptVariables.js', () => ({
  promptVariables: vi.fn(),
}));

vi.mock('../../src/cli/pickTemplate.js', () => ({
  pickTemplate: vi.fn(),
}));

vi.mock('../../src/utils/showError.js', () => ({
  showError: vi.fn(),
}));

vi.mock('ora', () => ({
  default: vi.fn().mockReturnValue({
    start: vi.fn().mockReturnThis(),
    stop: vi.fn().mockReturnThis(),
    succeed: vi.fn().mockReturnThis(),
  }),
}));

describe('runGeneration', () => {
  const mockSpinner = {
    start: vi.fn().mockReturnThis(),
    stop: vi.fn().mockReturnThis(),
    succeed: vi.fn().mockReturnThis(),
  };

  beforeEach(() => {
    vi.resetAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => {});

    vi.mocked(ora).mockReturnValue(mockSpinner as any);
  });

  it('should load config and process picked templates with variables', async () => {
    const mockTemplates = [{
      name: 'test',
      sourcePaths: [],
      outputPath: '',
      variables: [],
    }];
    const mockVariables = new Map();

    vi.mocked(loadConfig).mockResolvedValue({
      templates: mockTemplates,
      composites: []
    });
    vi.mocked(pickTemplate).mockResolvedValue(mockTemplates);
    vi.mocked(promptVariables).mockResolvedValue(mockVariables);
    vi.mocked(processTemplates).mockResolvedValue();

    await runGeneration('config.json', './base', false);

    expect(loadConfig).toHaveBeenCalledWith('./base', 'config.json');
    expect(pickTemplate).toHaveBeenCalledWith(mockTemplates, [], undefined);
    expect(promptVariables).toHaveBeenCalledWith(mockTemplates);
    expect(processTemplates).toHaveBeenCalledWith(
      mockTemplates,
      mockVariables,
      false,
      './base',
      mockSpinner
    );
    expect(mockSpinner.succeed).toHaveBeenCalledWith('Success!');
  });

  it('should throw error when no templates are found', async () => {
    vi.mocked(loadConfig).mockResolvedValue({ } as any);
    vi.mocked(pickTemplate).mockResolvedValue([]);

    await expect(runGeneration('config.json', './base', false))
      .rejects.toThrow(new JatgError('No templates found'));

    expect(processTemplates).not.toHaveBeenCalled();
  });

  it('should use template name when provided', async () => {
    const mockTemplates = [{
      name: 'specific-template',
      sourcePaths: [],
      outputPath: '',
      variables: [],
    }];

    vi.mocked(loadConfig).mockResolvedValue({
      templates: mockTemplates,
      composites: []
    });
    vi.mocked(pickTemplate).mockResolvedValue(mockTemplates);
    vi.mocked(promptVariables).mockResolvedValue(new Map());

    await runGeneration('config.json', './base', true, 'specific-template');

    expect(pickTemplate).toHaveBeenCalledWith(mockTemplates, [], 'specific-template');
    expect(processTemplates).toHaveBeenCalledWith(
      mockTemplates,
      new Map(),
      true,
      './base',
      mockSpinner
    );
  });

  it('should handle error during template processing', async () => {
    const mockError = new Error('Processing failed');
    const mockTemplates = [{
      name: 'test',
      sourcePaths: [],
      outputPath: '',
      variables: [],
    }];

    vi.mocked(loadConfig).mockResolvedValue({
      templates: mockTemplates,
      composites: []
    });
    vi.mocked(pickTemplate).mockResolvedValue(mockTemplates);
    vi.mocked(promptVariables).mockResolvedValue(new Map());
    vi.mocked(processTemplates).mockRejectedValue(mockError);

    await runGeneration('config.json', './base', false);

    expect(showError).toHaveBeenCalledWith(mockError, mockSpinner);
    expect(mockSpinner.succeed).not.toHaveBeenCalled();
  });
});
