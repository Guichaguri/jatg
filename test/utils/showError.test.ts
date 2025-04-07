import { beforeEach, expect, test, vi } from 'vitest';
import chalk from 'chalk';
import { showError } from '../../src/utils/showError.js';
import { JatgError } from '../../src/models/jatg-error.js';

console.log = vi.fn();
console.error = vi.fn();

const spinner: any = {
  isSpinning: true,
  fail: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
})

test('jatg error', () => {
  const error = new JatgError('Sample Error');

  showError(error);

  expect(console.error).toHaveBeenCalledTimes(1);
  expect(console.error).toHaveBeenCalledWith(chalk.red(error.message));
});

test('unexpected error', () => {
  const error = new Error('Sample Error');

  showError(error);

  expect(console.error).toHaveBeenCalledTimes(2);
  expect(console.error).toHaveBeenCalledWith(chalk.red(error.message));
  expect(console.error).toHaveBeenCalledWith(error);
});

test('string error', () => {
  const error = 'Sample Error';

  showError(error);

  expect(console.error).toHaveBeenCalledTimes(2);
  expect(console.error).toHaveBeenCalledWith(chalk.red(error));
  expect(console.error).toHaveBeenCalledWith(error);
});

test('null error', () => {
  const error = null;

  showError(error);

  expect(console.error).toHaveBeenCalledTimes(2);
  expect(console.error).toHaveBeenCalledWith(chalk.red('Internal Error'));
  expect(console.error).toHaveBeenCalledWith(error);
});

test('jatg error with spinner', () => {
  const error = new JatgError('Sample Error');

  showError(error, spinner);

  expect(console.error).toHaveBeenCalledTimes(0);
  expect(spinner.fail).toHaveBeenCalledWith(error.message);
});

test('unexpected error with spinner', () => {
  const error = new Error('Sample Error');

  showError(error, spinner);

  expect(console.error).toHaveBeenCalledTimes(1);
  expect(spinner.fail).toHaveBeenCalledWith(error.message);
  expect(console.error).toHaveBeenCalledWith(error);
});

test('string error with spinner', () => {
  const error = 'Sample Error';

  showError(error, spinner);

  expect(console.error).toHaveBeenCalledTimes(1);
  expect(spinner.fail).toHaveBeenCalledWith(error);
  expect(console.error).toHaveBeenCalledWith(error);
});

test('null error with spinner', () => {
  const error = null;

  showError(error, spinner);

  expect(console.error).toHaveBeenCalledTimes(1);
  expect(spinner.fail).toHaveBeenCalledWith('Internal Error');
  expect(console.error).toHaveBeenCalledWith(error);
});
