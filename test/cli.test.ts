import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { runInit } from '../src/cli/runInit.js';
import { runConversion } from '../src/cli/runConversion.js';
import { runGeneration } from '../src/cli/runGeneration.js';
import { showError } from '../src/utils/showError.js';

vi.mock('../src/cli/runInit.js', () => ({
  runInit: vi.fn(),
}));

vi.mock('../src/cli/runConversion.js', () => ({
  runConversion: vi.fn(),
}));

vi.mock('../src/cli/runGeneration.js', () => ({
  runGeneration: vi.fn(),
}));

vi.mock('../src/utils/showError.js', () => ({
  showError: vi.fn(),
}));

describe('CLI', () => {
  const originalArgv = process.argv;

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset process.argv
    process.argv = [...originalArgv];
  });

  afterEach(() => {
    process.argv = originalArgv;
    vi.resetModules();
  });

  it('should call runInit when --init option is provided', async () => {
    process.argv = [
      'node',
      'cli.js',
      '--init',
      '--templates-config', 'config.json',
      '--base-path', './test-base'
    ];

    await import('../src/cli.js');

    expect(runInit).toHaveBeenCalledWith('config.json', './test-base', undefined, undefined);
    expect(runConversion).not.toHaveBeenCalled();
    expect(runGeneration).not.toHaveBeenCalled();
  });

  it('should call runConversion when --convert option is provided', async () => {
    process.argv = [
      'node',
      'cli.js',
      '--convert',
      '--templates-config', 'convert.json',
      '--base-path', './convert-base',
      '--template', 'my-template',
      '--overwrite'
    ];

    await import('../src/cli.js');

    expect(runConversion).toHaveBeenCalledWith(
      'convert.json',
      './convert-base',
      true,
      'my-template'
    );
    expect(runInit).not.toHaveBeenCalled();
    expect(runGeneration).not.toHaveBeenCalled();
  });

  it('should call runGeneration when no special option is provided', async () => {
    process.argv = [
      'node',
      'cli.js',
      '--templates-config', 'gen.json',
      '--base-path', './gen-base'
    ];

    await import('../src/cli.js');

    expect(runGeneration).toHaveBeenCalledWith('gen.json', './gen-base', undefined, undefined);
    expect(runInit).not.toHaveBeenCalled();
    expect(runConversion).not.toHaveBeenCalled();
  });

  it('should handle errors and call showError', async () => {
    process.argv = [
      'node',
      'cli.js',
      '--init'
    ];

    const mockError = new Error('Test error');
    vi.mocked(runInit).mockRejectedValue(mockError);

    await import('../src/cli.js');

    await vi.waitFor(() => {
      expect(showError).toHaveBeenCalledWith(mockError);
    });
  });

  it('should use default values when options are not provided', async () => {
    process.argv = [
      'node',
      'cli.js'
    ];

    await import('../src/cli.js');

    expect(runGeneration).toHaveBeenCalledWith(
      './templates.json',  // default templates config
      './',                // default base path
      undefined,           // default overwrite (false)
      undefined            // default template
    );
  });
});
