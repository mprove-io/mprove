import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendProjectDoesNotExistError,
  zBackendProjectDoesNotExistError
} from '#common/types/backend/errors/backend-project-does-not-exist-error';
import {
  type ProjectEntToTabResultError,
  zProjectEntToTabResultError
} from '#common/types/backend/function-errors/project-ent-to-tab-result-error';

export type GetProjectCheckExistsResultError =
  | ProjectEntToTabResultError
  | BackendProjectDoesNotExistError;

export let zGetProjectCheckExistsResultError = z.union([
  zProjectEntToTabResultError,
  zBackendProjectDoesNotExistError
]);

assertTypesEqual<
  GetProjectCheckExistsResultError,
  z.infer<typeof zGetProjectCheckExistsResultError>
>({ value: true });
