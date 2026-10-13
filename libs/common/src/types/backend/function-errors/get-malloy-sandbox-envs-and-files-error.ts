import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type ConnectionEntToTabError,
  zConnectionEntToTabError
} from '#common/types/backend/function-errors/connection-ent-to-tab-error';
import {
  type GetApiEnvsError,
  zGetApiEnvsError
} from '#common/types/backend/function-errors/get-api-envs-error';

export type GetMalloySandboxEnvsAndFilesError =
  | GetApiEnvsError
  | ConnectionEntToTabError;

export let zGetMalloySandboxEnvsAndFilesError = z.union([
  zGetApiEnvsError,
  zConnectionEntToTabError
]);

assertTypesEqual<
  GetMalloySandboxEnvsAndFilesError,
  z.infer<typeof zGetMalloySandboxEnvsAndFilesError>
>({ value: true });
