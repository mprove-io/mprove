import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendSessionNotFoundError,
  zBackendSessionNotFoundError
} from '#common/types/backend/errors/backend-session-not-found-error';

export type ToBackendCreateSessionSseTicketError = BackendSessionNotFoundError;

export let zToBackendCreateSessionSseTicketError = zBackendSessionNotFoundError;

assertTypesEqual<
  ToBackendCreateSessionSseTicketError,
  z.infer<typeof zToBackendCreateSessionSseTicketError>
>({ value: true });
