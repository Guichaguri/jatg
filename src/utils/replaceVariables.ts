import { TemplateVariable } from '../models/template.model.js';
import { processVariableOperations } from './processVariableOperations.js';

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function replaceVariables(source: string, variables: TemplateVariable[], values: Map<string, string>): string {
  for (const variable of variables) {
    const regex = new RegExp('%\\s?' + escapeRegExp(variable.variable) + '(\\.[a-zA-Z.]+)?\\s?%', 'g');
    const value = values.get(variable.variable) ?? '';

    source = source.replace(regex, (_, ops) =>
      processVariableOperations(value, ops ? ops.substring(1).split('.') : [])
    );
  }

  return source;
}
