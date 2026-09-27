import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendError,
  zBackendError
} from '#common/zod/backend/errors/backend-error';

export type ToBackendGetMemberGivensError = BackendError;

export let zToBackendGetMemberGivensError = zBackendError;

assertTypesEqual<
  ToBackendGetMemberGivensError,
  z.infer<typeof zToBackendGetMemberGivensError>
>({ value: true });
