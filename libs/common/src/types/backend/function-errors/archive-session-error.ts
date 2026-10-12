import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type AcquireSessionLockError,
  zAcquireSessionLockError
} from '#common/types/backend/function-errors/acquire-session-lock-error';
import {
  type ArchiveSessionWhileLockedError,
  zArchiveSessionWhileLockedError
} from '#common/types/backend/function-errors/archive-session-while-locked-error';

export type ArchiveSessionError =
  | AcquireSessionLockError
  | ArchiveSessionWhileLockedError;

export let zArchiveSessionError = z.union([
  zAcquireSessionLockError,
  zArchiveSessionWhileLockedError
]);

assertTypesEqual<ArchiveSessionError, z.infer<typeof zArchiveSessionError>>({
  value: true
});
