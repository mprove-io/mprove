import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendError,
  zBackendError
} from '#common/zod/backend/errors/backend-error';

export type ToBackendGetEnvsListError = BackendError;

export let zToBackendGetEnvsListError = zBackendError;

assertTypesEqual<
  ToBackendGetEnvsListError,
  z.infer<typeof zToBackendGetEnvsListError>
>({ value: true });
