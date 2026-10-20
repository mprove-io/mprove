import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type GetTabPropsError,
  zGetTabPropsError
} from '#common/types/backend/function-errors/get-tab-props-error';
import {
  type MakeHashError,
  zMakeHashError
} from '#common/types/backend/function-errors/make-hash-error';

export type DbErrorToError = GetTabPropsError | MakeHashError;

export let zDbErrorToError = z.union([zGetTabPropsError, zMakeHashError]);

assertTypesEqual<DbErrorToError, z.infer<typeof zDbErrorToError>>({
  value: true
});
