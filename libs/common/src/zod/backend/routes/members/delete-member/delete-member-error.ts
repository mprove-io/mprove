import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendError,
  zBackendError
} from '#common/zod/backend/errors/backend-error';

export type ToBackendDeleteMemberError = BackendError;

export let zToBackendDeleteMemberError = zBackendError;

assertTypesEqual<
  ToBackendDeleteMemberError,
  z.infer<typeof zToBackendDeleteMemberError>
>({ value: true });
