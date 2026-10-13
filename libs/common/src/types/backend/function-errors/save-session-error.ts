import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type DbErrorToError,
  zDbErrorToError
} from '#common/types/backend/function-errors/db-error-to-error';

export type SaveSessionError = DbErrorToError;

export let zSaveSessionError = zDbErrorToError;

assertTypesEqual<SaveSessionError, z.infer<typeof zSaveSessionError>>({
  value: true
});
