import { describe, it, expect, vi, beforeEach } from 'vitest';
import { pickTemplate } from '../../src/cli/pickTemplate.js';
import { CompositeTemplateModel, TemplateModel } from '../../src/models/template.model.js';
import { JatgError } from '../../src/models/jatg-error.js';
import { prompt } from '../../src/utils/prompt.js';

vi.mock('../../src/utils/prompt', () => ({
  prompt: vi.fn(),
}));

describe('pickTemplate', () => {
  const templates: TemplateModel[] = [
    { name: 'template1', sourcePaths: [], outputPath: '', variables: [] },
    { name: 'template2', sourcePaths: [], outputPath: '', variables: [] },
  ];

  const composites: CompositeTemplateModel[] = [
    {
      name: 'composite1',
      templates: ['template1', 'template2'],
    },
    {
      name: 'composite2',
      templates: ['template1'],
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return a single template when template name is provided', async () => {
    const result = await pickTemplate(templates, composites, 'template1');
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(templates[0]);
  });

  it('should return multiple templates when composite template name is provided', async () => {
    const result = await pickTemplate(templates, composites, 'composite1');
    expect(result).toHaveLength(2);
    expect(result).toEqual([templates[0], templates[1]]);
  });

  it('should prompt for template when no template name is provided', async () => {
    vi.mocked(prompt).mockResolvedValueOnce({ template: 'template1' });

    const result = await pickTemplate(templates, composites);

    expect(prompt).toHaveBeenCalledOnce();
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(templates[0]);
  });

  it('should throw error when template is not found', async () => {
    await expect(pickTemplate(templates, composites, 'nonexistent'))
      .rejects
      .toThrow(new JatgError('Template "nonexistent" was not found'));
  });

  it('should throw error when no templates are registered', async () => {
    await expect(pickTemplate([], [], undefined))
      .rejects
      .toThrow(new JatgError('No templates registered. Initialize one with "jatg --init"'));
  });

  it('should handle nested composite templates', async () => {
    const nestedComposites: CompositeTemplateModel[] = [
      {
        name: 'nested',
        templates: ['composite1', 'template2'],
      },
    ];

    const result = await pickTemplate(templates, [...composites, ...nestedComposites], 'nested');

    expect(result).toHaveLength(3);
    expect(result).toEqual([templates[0], templates[1], templates[1]]);
  });
});
