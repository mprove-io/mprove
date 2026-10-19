import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type MakeHashError,
  zMakeHashError
} from '#common/types/backend/function-errors/make-hash-error';

export type UserTabToEntError = MakeHashError;

export let zUserTabToEntError = zMakeHashError;

assertTypesEqual<UserTabToEntError, z.infer<typeof zUserTabToEntError>>({
  value: true
});
