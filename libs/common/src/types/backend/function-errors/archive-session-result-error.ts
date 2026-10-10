import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type AcquireSessionLockResultError,
  zAcquireSessionLockResultError
} from '#common/types/backend/function-errors/acquire-session-lock-result-error';
import {
  type ArchiveSessionWhileLockedResultError,
  zArchiveSessionWhileLockedResultError
} from '#common/types/backend/function-errors/archive-session-while-locked-result-error';

export type ArchiveSessionResultError =
  | AcquireSessionLockResultError
  | ArchiveSessionWhileLockedResultError;

export let zArchiveSessionResultError = z.union([
  zAcquireSessionLockResultError,
  zArchiveSessionWhileLockedResultError
]);

assertTypesEqual<
  ArchiveSessionResultError,
  z.infer<typeof zArchiveSessionResultError>
>({ value: true });
