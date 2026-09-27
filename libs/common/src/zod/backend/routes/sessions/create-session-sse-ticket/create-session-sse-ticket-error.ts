import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendError,
  zBackendError
} from '#common/zod/backend/errors/backend-error';

export type ToBackendCreateSessionSseTicketError = BackendError;

export let zToBackendCreateSessionSseTicketError = zBackendError;

assertTypesEqual<
  ToBackendCreateSessionSseTicketError,
  z.infer<typeof zToBackendCreateSessionSseTicketError>
>({ value: true });
