import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendConnectionDoesNotExistError,
  zBackendConnectionDoesNotExistError
} from '#common/types/backend/errors/backend-connection-does-not-exist-error';
import {
  type ConnectionEntToTabResultError,
  zConnectionEntToTabResultError
} from '#common/types/backend/function-errors/connection-ent-to-tab-result-error';

export type GetConnectionCheckExistsResultError =
  | BackendConnectionDoesNotExistError
  | ConnectionEntToTabResultError;

export let zGetConnectionCheckExistsResultError = z.union([
  zBackendConnectionDoesNotExistError,
  zConnectionEntToTabResultError
]);

assertTypesEqual<
  GetConnectionCheckExistsResultError,
  z.infer<typeof zGetConnectionCheckExistsResultError>
>({ value: true });
