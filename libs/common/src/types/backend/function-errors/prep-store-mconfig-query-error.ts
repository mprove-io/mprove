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

export type PrepStoreMconfigQueryError =
  | GetApiEnvsError
  | ConnectionEntToTabError;

export const zPrepStoreMconfigQueryError = z.union([
  zGetApiEnvsError,
  zConnectionEntToTabError
]);

assertTypesEqual<
  PrepStoreMconfigQueryError,
  z.infer<typeof zPrepStoreMconfigQueryError>
>({ value: true });
