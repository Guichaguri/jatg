import { describe, it, expect, vi, beforeEach } from 'vitest';
import { promptVariables } from '../../src/cli/promptVariables.js';
import { TemplateModel } from '../../src/models/template.model.js';
import { prompt } from '../../src/utils/prompt.js';

vi.mock('../../src/utils/prompt', () => ({
  prompt: vi.fn(),
}));

const promptMock = vi.mocked(prompt);

describe('promptVariables', () => {
  beforeEach(() => {
    vi.resetAllMocks();

    delete process.env['JATG_VARIABLE_NAME'];
    delete process.env['JATG_VARIABLE_AGE'];
  });

  it('should return empty map for empty templates array', async () => {
    const result = await promptVariables([]);
    expect(result).toBeInstanceOf(Map);
    expect(result.size).toBe(0);
  });

  it('should prompt for each unique variable', async () => {
    const templates: TemplateModel[] = [
      {
        name: 'test',
        sourcePaths: [],
        outputPath: '',
        variables: [
          { variable: 'name', name: 'Name' },
          { variable: 'age', name: 'Age', type: 'number' }
        ]
      }
    ];

    promptMock
      .mockResolvedValueOnce({ value: 'John' })
      .mockResolvedValueOnce({ value: '25' });

    const result = await promptVariables(templates);

    expect(result.get('name')).toBe('John');
    expect(result.get('age')).toBe('25');
    expect(promptMock).toHaveBeenCalledTimes(2);
  });

  it('should not prompt for duplicate variables', async () => {
    const templates: TemplateModel[] = [
      {
        name: 'test1',
        sourcePaths: [],
        outputPath: '',
        variables: [{ variable: 'name', name: 'Name' }]
      },
      {
        name: 'test2',
        sourcePaths: [],
        outputPath: '',
        variables: [{ variable: 'name', name: 'Name' }]
      }
    ];

    promptMock
      .mockResolvedValueOnce({ value: 'John' });

    const result = await promptVariables(templates);

    expect(result.get('name')).toBe('John');
    expect(promptMock).toHaveBeenCalledTimes(1);
  });

  it('should use environment variables when available', async () => {
    process.env['JATG_VARIABLE_NAME'] = 'John';

    const templates: TemplateModel[] = [
      {
        name: 'test',
        sourcePaths: [],
        outputPath: '',
        variables: [{ variable: 'name', name: 'Name' }]
      }
    ];

    const result = await promptVariables(templates);

    expect(result.get('name')).toBe('John');
    expect(prompt).not.toHaveBeenCalled();
  });

  it('should handle variables with choices', async () => {
    const templates: TemplateModel[] = [
      {
        name: 'test',
        sourcePaths: [],
        outputPath: '',
        variables: [
          {
            variable: 'color',
            name: 'Color',
            choices: ['red', 'blue', 'green'],
            initial: 'purple',
          }
        ]
      }
    ];

    promptMock.mockResolvedValueOnce({ value: 'blue' });

    const result = await promptVariables(templates);

    expect(result.get('color')).toBe('blue');
    expect(promptMock).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'select',
        choices: expect.arrayContaining([
          expect.objectContaining({ value: 'red' }),
          expect.objectContaining({ value: 'blue' }),
          expect.objectContaining({ value: 'green' })
        ])
      })
    );
  });

  it('should handle variables with initial values', async () => {
    const templates: TemplateModel[] = [
      {
        name: 'test',
        sourcePaths: [],
        outputPath: '',
        variables: [
          {
            variable: 'name',
            name: 'Name',
            initial: 'John Doe'
          }
        ]
      }
    ];

    promptMock.mockResolvedValueOnce({ value: 'John Doe' });

    const result = await promptVariables(templates);

    expect(result.get('name')).toBe('John Doe');
    expect(promptMock).toHaveBeenCalledWith(
      expect.objectContaining({
        initial: 'John Doe'
      })
    );
  });

  it('should not allow initial empty values', async () => {
    const templates: TemplateModel[] = [
      {
        name: 'test',
        sourcePaths: [],
        outputPath: '',
        variables: [
          {
            variable: 'name',
            allowEmpty: false,
            initial: '',
          }
        ]
      }
    ];

    promptMock.mockResolvedValueOnce({ value: 'John Doe' });

    const result = await promptVariables(templates);

    expect(result.get('name')).toBe('John Doe');
    expect((promptMock.mock.calls[0][0] as any).validate(''))
      .toBe('The value cannot be empty');
    expect(prompt).toHaveBeenCalledWith(
      expect.objectContaining({
        initial: undefined,
      }),
    );
  });
});
