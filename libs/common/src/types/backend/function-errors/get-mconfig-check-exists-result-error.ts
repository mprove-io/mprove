import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendMconfigDoesNotExistError,
  zBackendMconfigDoesNotExistError
} from '#common/types/backend/errors/backend-mconfig-does-not-exist-error';
import {
  type MconfigEntToTabResultError,
  zMconfigEntToTabResultError
} from '#common/types/backend/function-errors/mconfig-ent-to-tab-result-error';

export type GetMconfigCheckExistsResultError =
  | BackendMconfigDoesNotExistError
  | MconfigEntToTabResultError;

export let zGetMconfigCheckExistsResultError = z.union([
  zBackendMconfigDoesNotExistError,
  zMconfigEntToTabResultError
]);

assertTypesEqual<
  GetMconfigCheckExistsResultError,
  z.infer<typeof zGetMconfigCheckExistsResultError>
>({ value: true });
