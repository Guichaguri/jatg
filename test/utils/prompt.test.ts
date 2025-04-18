import { describe, expect, it, vi } from 'vitest';
import prompts from 'prompts';
import { prompt } from '../../src/utils/prompt.js';
import { JatgError } from '../../src/models/jatg-error.js';

vi.mock('prompts', () => ({
  default: vi.fn(),
}));

describe('prompt', () => {
  const promptMocked = vi.mocked(prompts);

  const questions = [
    {
      name: 'test',
      message: 'Sample',
      type: 'text',
    }
  ] satisfies prompts.PromptObject<string>[];

  it('should pass parameters to prompts as-is', async () => {
    const promptsResult = {};

    promptMocked.mockResolvedValueOnce(promptsResult);

    const result = await prompt(questions);

    expect(promptMocked).toHaveBeenCalledWith(questions, expect.any(Object));
    expect(result).toBe(promptsResult);
  });

  it('should throw when the prompt is cancelled', async () => {
    const promptsResult = {};

    promptMocked.mockImplementationOnce(async (_, options) => {
      options?.onCancel?.({} as any, promptsResult);
      return promptsResult;
    });

    expect(prompt(questions)).rejects.toBeInstanceOf(JatgError);
    expect(promptMocked).toHaveBeenCalledWith(questions, expect.any(Object));
  });
});
