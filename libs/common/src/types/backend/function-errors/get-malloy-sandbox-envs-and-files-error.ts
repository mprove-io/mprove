import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type DbConnectionsFindManyError,
  zDbConnectionsFindManyError
} from '#common/types/backend/function-errors/db/connections/db-connections-find-many-error';
import {
  type GetApiEnvsError,
  zGetApiEnvsError
} from '#common/types/backend/function-errors/get-api-envs-error';

export type GetMalloySandboxEnvsAndFilesError =
  | GetApiEnvsError
  | DbConnectionsFindManyError;

export let zGetMalloySandboxEnvsAndFilesError = z.union([
  zGetApiEnvsError,
  zDbConnectionsFindManyError
]);

assertTypesEqual<
  GetMalloySandboxEnvsAndFilesError,
  z.infer<typeof zGetMalloySandboxEnvsAndFilesError>
>({ value: true });
