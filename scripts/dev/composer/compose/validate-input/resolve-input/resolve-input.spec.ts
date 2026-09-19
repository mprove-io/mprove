import { resolve } from 'node:path';
import { Result } from '@praha/byethrow';
import test from 'ava';
import type { ComposeInput } from '../../../types/compose-input';
import { resolveInput } from './resolve-input';

test('resolves input paths against the current working directory', t => {
  let result: Result.Result<ComposeInput, never> = resolveInput({
    argv: ['.composer/COMPOSER.md', '.composer/content', 'AGENTS.md']
  });

  t.deepEqual(result, {
    type: 'Success',
    value: {
      contentDirectory: resolve(process.cwd(), '.composer/content'),
      manifestPath: resolve(process.cwd(), '.composer/COMPOSER.md'),
      outputPath: resolve(process.cwd(), 'AGENTS.md')
    }
  });
});
