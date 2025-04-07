import { expect, test } from 'vitest';
import { replaceVariables } from '../../src/utils/replaceVariables.js';
import { TemplateVariable } from '../../src/models/template.model.js';

const variables: TemplateVariable[] = [
  { variable: 'simple' },
  { variable: 'withprocessing', preprocessing: ['upper'] },
  { variable: 'upper' },
  { variable: 'name' },
];

const data = new Map<string, string>();
data.set('simple', 'hello');
data.set('withprocessing', 'world');
data.set('upper', 'The Upper');

test('simple replacement', () => {
  const source = `%simple%`;
  const result = `hello`;

  expect(replaceVariables(source, variables, data)).toStrictEqual(result);
});

test('simple replacement with context around', () => {
  const source = `Something %simple% % simple % something`;
  const result = `Something hello hello something`;

  expect(replaceVariables(source, variables, data)).toStrictEqual(result);
});

test('multiple variables', () => {
  const source = `%upper% %simple% %simple%`;
  const result = `The Upper hello hello`;

  expect(replaceVariables(source, variables, data)).toStrictEqual(result);
});

test('variable functions', () => {
  const source = `%simple.plural% %withprocessing% %simple.plural.singular.upper%`;
  const result = `hellos WORLD HELLO`;

  expect(replaceVariables(source, variables, data)).toStrictEqual(result);
});

test('malformed variables', () => {
  const source = `%simple  %  % simple`;

  expect(replaceVariables(source, variables, data)).toStrictEqual(source);
});

test('undefined variable', () => {
  const source = `Hello %name%`;

  expect(replaceVariables(source, variables, data)).toStrictEqual('Hello ');
});
