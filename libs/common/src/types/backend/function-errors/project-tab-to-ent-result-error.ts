import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type MakeHashResultError,
  zMakeHashResultError
} from '#common/types/backend/function-errors/make-hash-result-error';

export type ProjectTabToEntResultError = MakeHashResultError;

export let zProjectTabToEntResultError = zMakeHashResultError;

assertTypesEqual<
  ProjectTabToEntResultError,
  z.infer<typeof zProjectTabToEntResultError>
>({ value: true });
