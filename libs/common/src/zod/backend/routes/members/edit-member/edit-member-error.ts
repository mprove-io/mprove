import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendError,
  zBackendError
} from '#common/zod/backend/errors/backend-error';

export type ToBackendEditMemberError = BackendError;

export let zToBackendEditMemberError = zBackendError;

assertTypesEqual<
  ToBackendEditMemberError,
  z.infer<typeof zToBackendEditMemberError>
>({ value: true });
