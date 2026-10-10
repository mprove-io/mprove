import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendSessionNotFoundError,
  zBackendSessionNotFoundError
} from '#common/types/backend/errors/backend-session-not-found-error';
import {
  type SessionEntToTabResultError,
  zSessionEntToTabResultError
} from '#common/types/backend/function-errors/session-ent-to-tab-result-error';

export type GetSessionByIdCheckExistsResultError =
  | BackendSessionNotFoundError
  | SessionEntToTabResultError;

export let zGetSessionByIdCheckExistsResultError = z.union([
  zBackendSessionNotFoundError,
  zSessionEntToTabResultError
]);

assertTypesEqual<
  GetSessionByIdCheckExistsResultError,
  z.infer<typeof zGetSessionByIdCheckExistsResultError>
>({ value: true });
