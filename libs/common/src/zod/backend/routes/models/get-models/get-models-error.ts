import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendError,
  zBackendError
} from '#common/zod/backend/errors/backend-error';

export type ToBackendGetModelsError = BackendError;

export let zToBackendGetModelsError = zBackendError;

assertTypesEqual<
  ToBackendGetModelsError,
  z.infer<typeof zToBackendGetModelsError>
>({ value: true });
