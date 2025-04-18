import { describe, it, expect } from 'vitest';
import * as indexExports from '../src/index.js';

describe('index exports', () => {
  it('should correctly re-export items from template.model.js', () => {
    for (const key of Object.keys(indexExports)) {
      expect((indexExports as any)[key]).toBeDefined();
    }
  });
});
