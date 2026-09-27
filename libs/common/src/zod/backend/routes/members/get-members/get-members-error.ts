import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendError,
  zBackendError
} from '#common/zod/backend/errors/backend-error';

export type ToBackendGetMembersError = BackendError;

export let zToBackendGetMembersError = zBackendError;

assertTypesEqual<
  ToBackendGetMembersError,
  z.infer<typeof zToBackendGetMembersError>
>({ value: true });
