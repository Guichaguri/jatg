import { prompt } from '../utils/prompt.js';
import { TemplateModel, TemplateVariable } from '../models/template.model.js';

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

function validateValue(variable: TemplateVariable, value: string | number | undefined | null): string | true {
  if (!variable.allowEmpty && typeof value === 'string' && !value)
    return 'The value cannot be empty';

  if (value && variable.choices && variable.choices.length > 0 && !variable.choices.includes(value.toString()))
    return 'The value must be a valid option';

  return true;
}

async function promptVariable(variable: TemplateVariable): Promise<string> {
  const envValue = process.env['JATG_VARIABLE_' + variable.variable.toUpperCase()];

  if (envValue && validateValue(variable, envValue) === true)
    return envValue;

  const hasChoices = variable.choices && variable.choices.length > 0;

  const { value } = await prompt({
    name: 'value',
    message: variable.name || variable.variable,
    hint: variable.description,
    type: hasChoices ? 'select' : (variable.type === 'number' ? 'number' : 'text'),
    choices: hasChoices ? variable.choices?.map(choice => ({
      value: choice,
      title: choice,
    })) : undefined,
    initial: validateValue(variable, variable.initial) === true ? variable.initial : undefined,
    validate: value => validateValue(variable, value),
  });

  return value;
}
