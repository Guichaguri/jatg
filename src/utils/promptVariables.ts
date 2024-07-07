import prompts from 'prompts';
import { TemplateModel } from '../models/template.model.js';

export async function promptVariables(templates: TemplateModel[]): Promise<Map<string, string>> {
  const values = new Map<string, string>();

  for (const template of templates) {
    for (const variable of template.variables) {
      if (values.has(variable.variable))
        continue;

      const hasChoices = variable.choices && variable.choices.length > 0;
      const hasInvalidInitial = hasChoices && variable.initial && !variable.choices?.includes(variable.initial.toString());

      const { value } = await prompts({
        name: 'value',
        message: variable.name || variable.variable,
        hint: variable.description,
        type: hasChoices ? 'select' : (variable.type === 'number' ? 'number' : 'text'),
        choices: hasChoices ? variable.choices?.map(choice => ({
          value: choice,
          title: choice,
        })) : undefined,
        initial: hasInvalidInitial ? undefined : variable.initial,
      });

      values.set(variable.variable, value.toString());
    }
  }

  return values;
}
