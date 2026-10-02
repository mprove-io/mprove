import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendSessionNotFoundError,
  zBackendSessionNotFoundError
} from '#common/types/backend/errors/backend-session-not-found-error';

export type ToBackendSetSessionTitleError = BackendSessionNotFoundError;

export let zToBackendSetSessionTitleError = zBackendSessionNotFoundError;

assertTypesEqual<
  ToBackendSetSessionTitleError,
  z.infer<typeof zToBackendSetSessionTitleError>
>({ value: true });
