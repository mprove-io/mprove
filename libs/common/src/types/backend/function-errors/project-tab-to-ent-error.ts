import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type MakeHashError,
  zMakeHashError
} from '#common/types/backend/function-errors/make-hash-error';

export type ProjectTabToEntError = MakeHashError;

export let zProjectTabToEntError = zMakeHashError;

assertTypesEqual<ProjectTabToEntError, z.infer<typeof zProjectTabToEntError>>({
  value: true
});
