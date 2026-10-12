import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendConnectionDoesNotExistError,
  zBackendConnectionDoesNotExistError
} from '#common/types/backend/errors/backend-connection-does-not-exist-error';
import {
  type ConnectionEntToTabError,
  zConnectionEntToTabError
} from '#common/types/backend/function-errors/connection-ent-to-tab-error';

export type GetConnectionCheckExistsError =
  | BackendConnectionDoesNotExistError
  | ConnectionEntToTabError;

export let zGetConnectionCheckExistsError = z.union([
  zBackendConnectionDoesNotExistError,
  zConnectionEntToTabError
]);

assertTypesEqual<
  GetConnectionCheckExistsError,
  z.infer<typeof zGetConnectionCheckExistsError>
>({ value: true });
