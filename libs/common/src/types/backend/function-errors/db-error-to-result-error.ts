import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type GetTabPropsResultError,
  zGetTabPropsResultError
} from '#common/types/backend/function-errors/get-tab-props-result-error';
import {
  type MakeHashResultError,
  zMakeHashResultError
} from '#common/types/backend/function-errors/make-hash-result-error';

export type DbErrorToResultError = GetTabPropsResultError | MakeHashResultError;

export let zDbErrorToResultError = z.union([
  zGetTabPropsResultError,
  zMakeHashResultError
]);

assertTypesEqual<DbErrorToResultError, z.infer<typeof zDbErrorToResultError>>({
  value: true
});
