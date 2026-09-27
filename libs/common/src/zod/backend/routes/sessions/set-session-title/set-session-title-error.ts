import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendError,
  zBackendError
} from '#common/zod/backend/errors/backend-error';

export type ToBackendSetSessionTitleError = BackendError;

export let zToBackendSetSessionTitleError = zBackendError;

assertTypesEqual<
  ToBackendSetSessionTitleError,
  z.infer<typeof zToBackendSetSessionTitleError>
>({ value: true });
