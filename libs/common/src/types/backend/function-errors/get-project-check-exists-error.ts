import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendProjectDoesNotExistError,
  zBackendProjectDoesNotExistError
} from '#common/types/backend/errors/backend-project-does-not-exist-error';
import {
  type ProjectEntToTabError,
  zProjectEntToTabError
} from '#common/types/backend/function-errors/project-ent-to-tab-error';

export type GetProjectCheckExistsError =
  | ProjectEntToTabError
  | BackendProjectDoesNotExistError;

export let zGetProjectCheckExistsError = z.union([
  zProjectEntToTabError,
  zBackendProjectDoesNotExistError
]);

assertTypesEqual<
  GetProjectCheckExistsError,
  z.infer<typeof zGetProjectCheckExistsError>
>({ value: true });
