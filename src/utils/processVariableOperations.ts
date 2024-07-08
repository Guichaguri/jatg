import * as changeCase from 'change-case';
import pluralize from 'pluralize';
import { VariableOperation } from '../models/template.model.js';
import { JatgError } from '../models/jatg-error.js';

const operationFunctions: Record<VariableOperation, (value: string) => string> = {
  // Plain JS functions
  upper: value => value.toUpperCase(),
  lower: value => value.toLowerCase(),
  trim: value => value.trim(),
  unaccent: value => value.normalize("NFD").replace(/[\u0300-\u036f]/g, ''),

  // change-case functions
  camelCase: value => changeCase.camelCase(value),
  capitalCase: value => changeCase.capitalCase(value),
  constantCase: value => changeCase.constantCase(value),
  dotCase: value => changeCase.dotCase(value),
  kebabCase: value => changeCase.kebabCase(value),
  noCase: value => changeCase.noCase(value),
  pascalCase: value => changeCase.pascalCase(value),
  pascalSnakeCase: value => changeCase.pascalSnakeCase(value),
  pathCase: value => changeCase.pathCase(value),
  sentenceCase: value => changeCase.sentenceCase(value),
  snakeCase: value => changeCase.snakeCase(value),
  trainCase: value => changeCase.trainCase(value),
  initials: value => changeCase.split(value).map(item => item[0]).join('').toUpperCase(),

  // pluralize functions
  plural: value => pluralize.plural(value),
  singular: value => pluralize.singular(value),
};

export function processVariableOperations(value: string, operations: VariableOperation[], context?: string): string {
  if (operations.length === 0)
    return value;

  for (const op of operations) {
    if (!operationFunctions[op])
      throw new JatgError(`Invalid variable function "${op}" at ${context || 'unknown'}`);

    value = operationFunctions[op](value);
  }

  return value;
}
