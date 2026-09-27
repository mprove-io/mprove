import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendError,
  zBackendError
} from '#common/zod/backend/errors/backend-error';

export type ToBackendEditGivenError = BackendError;

export let zToBackendEditGivenError = zBackendError;

assertTypesEqual<
  ToBackendEditGivenError,
  z.infer<typeof zToBackendEditGivenError>
>({ value: true });
