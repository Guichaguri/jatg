import ora, { Ora } from 'ora';
import { JatgError } from '../models/jatg-error.js';

export function showError(error: unknown, spinner?: Ora): void {
  const message: string = (error as Error)?.message || error?.toString() || 'Internal Error';
  const shouldShowDetails = !(error instanceof JatgError);

  if (spinner && spinner.isSpinning) {
    spinner.fail(message);
  } else {
    ora(message).fail(message);
  }

  console.log();

  if (shouldShowDetails) {
    console.error(error);
  }
}
