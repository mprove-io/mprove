import { resolve } from 'node:path';
import { Result } from '@praha/byethrow';
import test from 'ava';
import type { ResolveComposeInputError } from '../../types/function-errors/resolve-compose-input-error';
import {
  type ResolvedComposeInput,
  resolveComposeInput
} from './resolve-compose-input';

test('resolves manifest, content, and output paths', t => {
  let result: Result.Result<ResolvedComposeInput, ResolveComposeInputError> =
    resolveComposeInput({
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

test('rejects a manifest inside the content directory', t => {
  let result: Result.Result<ResolvedComposeInput, ResolveComposeInputError> =
    resolveComposeInput({
      argv: ['.composer/content/COMPOSER.md', '.composer/content', 'AGENTS.md']
    });

  t.is(result.type, 'Failure');

  if (result.type === 'Failure') {
    t.is(result.error.code, 'COMPOSER_MANIFEST_PATH_IN_CONTENT_DIRECTORY');
  }
});

test('rejects output inside the content directory', t => {
  let result: Result.Result<ResolvedComposeInput, ResolveComposeInputError> =
    resolveComposeInput({
      argv: [
        '.composer/COMPOSER.md',
        '.composer/content',
        '.composer/content/AGENTS.md'
      ]
    });

  t.is(result.type, 'Failure');

  if (result.type === 'Failure') {
    t.is(result.error.code, 'COMPOSER_OUTPUT_PATH_IN_CONTENT_DIRECTORY');
  }
});
