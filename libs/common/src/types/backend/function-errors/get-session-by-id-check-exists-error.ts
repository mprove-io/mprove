import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendSessionNotFoundError,
  zBackendSessionNotFoundError
} from '#common/types/backend/errors/backend-session-not-found-error';
import {
  type SessionEntToTabError,
  zSessionEntToTabError
} from '#common/types/backend/function-errors/session-ent-to-tab-error';

export type GetSessionByIdCheckExistsError =
  | BackendSessionNotFoundError
  | SessionEntToTabError;

export let zGetSessionByIdCheckExistsError = z.union([
  zBackendSessionNotFoundError,
  zSessionEntToTabError
]);

assertTypesEqual<
  GetSessionByIdCheckExistsError,
  z.infer<typeof zGetSessionByIdCheckExistsError>
>({ value: true });
