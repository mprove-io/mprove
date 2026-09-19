import { Result } from '@praha/byethrow';
import test from 'ava';
import type { ValidateArgumentCountError } from '../../../types/function-errors/validate-argument-count-error';
import { validateArgumentCount } from './validate-argument-count';

[
  { count: 0, isValid: false },
  { count: 2, isValid: false },
  { count: 3, isValid: true },
  { count: 4, isValid: false }
].forEach(testCase => {
  test(`accepts exactly three arguments: ${testCase.count}`, t => {
    let argv: string[] = Array.from(
      { length: testCase.count },
      (_, index) => `${index}`
    );

    let result: Result.Result<void, ValidateArgumentCountError> =
      validateArgumentCount({ argv: argv });

    if (testCase.isValid) {
      t.is(result.type, 'Success');

      return;
    }

    t.is(result.type, 'Failure');

    if (result.type === 'Failure') {
      t.is(result.error.code, 'COMPOSER_ARGUMENT_COUNT_INVALID');
    }
  });
});
