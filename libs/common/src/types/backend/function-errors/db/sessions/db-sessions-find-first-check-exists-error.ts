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

export type DbSessionsFindFirstCheckExistsError =
  | SessionEntToTabError
  | BackendSessionNotFoundError;

export let zDbSessionsFindFirstCheckExistsError = z.union([
  zSessionEntToTabError,
  zBackendSessionNotFoundError
]);

assertTypesEqual<
  DbSessionsFindFirstCheckExistsError,
  z.infer<typeof zDbSessionsFindFirstCheckExistsError>
>({
  value: true
});
