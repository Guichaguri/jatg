import type { Ora } from 'ora';
import chalk from 'chalk';
import { JatgError } from '../models/jatg-error.js';

export function showError(error: unknown, spinner?: Ora): void {
  const message: string = (error as Error)?.message || error?.toString() || 'Internal Error';
  const shouldShowDetails = !(error instanceof JatgError);

  if (spinner && spinner.isSpinning) {
    spinner.fail(message);
  } else {
    console.error(chalk.red(message));
  }

  console.log();

  if (shouldShowDetails) {
    console.error(error);
  }
}
