import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendError,
  zBackendError
} from '#common/zod/backend/errors/backend-error';

export type ToBackendGetOrgsListError = BackendError;

export let zToBackendGetOrgsListError = zBackendError;

assertTypesEqual<
  ToBackendGetOrgsListError,
  z.infer<typeof zToBackendGetOrgsListError>
>({ value: true });
