import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendError,
  zBackendError
} from '#common/zod/backend/errors/backend-error';

export type ToBackendGetProvidersError = BackendError;

export let zToBackendGetProvidersError = zBackendError;

assertTypesEqual<
  ToBackendGetProvidersError,
  z.infer<typeof zToBackendGetProvidersError>
>({ value: true });
