import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendError,
  zBackendError
} from '#common/zod/backend/errors/backend-error';

export type ToBackendGetConnectionsListError = BackendError;

export let zToBackendGetConnectionsListError = zBackendError;

assertTypesEqual<
  ToBackendGetConnectionsListError,
  z.infer<typeof zToBackendGetConnectionsListError>
>({ value: true });
