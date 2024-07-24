import prompts from 'prompts';
import { TemplateModel, TemplateVariable } from '../models/template.model.js';
import { JatgError } from '../models/jatg-error.js';

export async function promptVariables(templates: TemplateModel[]): Promise<Map<string, string>> {
  const values = new Map<string, string>();

  for (const template of templates) {
    for (const variable of template.variables) {
      if (values.has(variable.variable))
        continue;

      const value = await promptVariable(variable);

      values.set(variable.variable, value.toString());
    }
  }

  return values;
}

async function promptVariable(variable: TemplateVariable): Promise<string> {
  const hasChoices = variable.choices && variable.choices.length > 0;

  const envValue = process.env['JATG_VARIABLE_' + variable.variable.toUpperCase()];
  const hasInvalidEnv = hasChoices && envValue && !variable.choices?.includes(envValue);

  if (envValue && !hasInvalidEnv)
    return envValue;

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
    validate: value => !variable.allowEmpty && typeof value === 'string' && !value ? 'The value cannot be empty' : true,
  }, {
    onCancel: () => { throw new JatgError('Generation canceled'); }
  });

  return value;
}
