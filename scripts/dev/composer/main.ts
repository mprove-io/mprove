import type { Result } from '@praha/byethrow';
import { compose } from './compose/compose';
import type { ComposeError } from './types/function-errors/compose-error';

let argv: string[] = process.argv.slice(2);

let result: Result.Result<void, ComposeError> = compose({ argv: argv });

if (result.type === 'Failure') {
  console.error(result.error);

  process.exitCode = 1;
}
