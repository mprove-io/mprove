import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type MakeHashError,
  zMakeHashError
} from '#common/types/backend/function-errors/make-hash-error';

export type QueryTabToEntError = MakeHashError;

export let zQueryTabToEntError = zMakeHashError;

assertTypesEqual<QueryTabToEntError, z.infer<typeof zQueryTabToEntError>>({
  value: true
});
