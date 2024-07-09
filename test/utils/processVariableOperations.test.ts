import { expect, assert, test } from 'vitest';
import { processVariableOperations } from '../../src/utils/processVariableOperations.js';
import { JatgError } from '../../src/models/jatg-error';

test('zero function', () => {
  expect(processVariableOperations('Something', [])).toStrictEqual('Something');
  expect(processVariableOperations('Maçã', [])).toStrictEqual('Maçã');
  expect(processVariableOperations('', [])).toStrictEqual('');
});

test('one function', () => {
  expect(processVariableOperations(' something ', ['trim'])).toStrictEqual('something');
  expect(processVariableOperations('Something', ['upper'])).toStrictEqual('SOMETHING');
  expect(processVariableOperations('Something', ['lower'])).toStrictEqual('something');
  expect(processVariableOperations('Maçã', ['unaccent'])).toStrictEqual('Maca');
  expect(processVariableOperations('two-words', ['camelCase'])).toStrictEqual('twoWords');
  expect(processVariableOperations('apple', ['plural'])).toStrictEqual('apples');
  expect(processVariableOperations('', ['camelCase'])).toStrictEqual('');
});

test('multiple functions', () => {
  expect(processVariableOperations(' apple ', ['trim', 'plural', 'upper'])).toStrictEqual('APPLES');
  expect(processVariableOperations('twoWords', ['capitalCase', 'lower'])).toStrictEqual('two words');
  expect(processVariableOperations('twoWords', ['kebabCase', 'initials'])).toStrictEqual('TW');
  expect(processVariableOperations('', ['dotCase', 'trim', 'lower'])).toStrictEqual('');
});

test('invalid functions', () => {
  assert.throws(() => processVariableOperations('something', ['invalid' as any]), JatgError);
  assert.throws(() => processVariableOperations('something', ['UPPER' as any]), JatgError);
  assert.throws(() => processVariableOperations('something', ['camelcase' as any]), JatgError);
});
