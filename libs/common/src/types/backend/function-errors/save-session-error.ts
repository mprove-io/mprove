import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type WriteError,
  zWriteError
} from '#common/types/backend/function-errors/write-error';

export type SaveSessionError = WriteError;

export let zSaveSessionError = zWriteError;

assertTypesEqual<SaveSessionError, z.infer<typeof zSaveSessionError>>({
  value: true
});
