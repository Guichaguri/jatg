import prompts from 'prompts';
import { JatgError } from '../models/jatg-error.js';

export async function prompt<T extends string = string>(
  questions: prompts.PromptObject<T> | Array<prompts.PromptObject<T>>,
): Promise<prompts.Answers<T>> {
  return await prompts(questions, {
    onCancel: () => {
      throw new JatgError('Operation canceled');
    }
  });
}
