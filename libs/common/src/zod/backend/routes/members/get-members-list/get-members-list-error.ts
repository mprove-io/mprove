import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendError,
  zBackendError
} from '#common/zod/backend/errors/backend-error';

export type ToBackendGetMembersListError = BackendError;

export let zToBackendGetMembersListError = zBackendError;

assertTypesEqual<
  ToBackendGetMembersListError,
  z.infer<typeof zToBackendGetMembersListError>
>({ value: true });
