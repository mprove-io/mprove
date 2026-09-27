import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendError,
  zBackendError
} from '#common/zod/backend/errors/backend-error';

export type ToBackendGetQueryInfoError = BackendError;

export let zToBackendGetQueryInfoError = zBackendError;

assertTypesEqual<
  ToBackendGetQueryInfoError,
  z.infer<typeof zToBackendGetQueryInfoError>
>({ value: true });
