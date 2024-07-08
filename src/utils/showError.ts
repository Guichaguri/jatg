import type { Ora } from 'ora';
import { JatgError } from '../models/jatg-error.js';

export function showError(error: unknown, ora?: Ora): void {
  const message: string = (error as Error)?.message || error?.toString() || 'Internal Error';
  const shouldShowDetails = !(error instanceof JatgError);

  if (ora && ora.isSpinning) {
    ora.fail(message);
  } else {
    console.error(message);
  }

  if (shouldShowDetails) {
    console.log();
    console.error(error);
  }
}
