import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendProjectDoesNotExistError,
  zBackendProjectDoesNotExistError
} from '#common/types/backend/errors/backend-project-does-not-exist-error';
import {
  type GetTabPropsResultError,
  zGetTabPropsResultError
} from '#common/types/backend/function-errors/get-tab-props-result-error';

export type GetProjectCheckExistsResultError =
  | GetTabPropsResultError
  | BackendProjectDoesNotExistError;

export let zGetProjectCheckExistsResultError = z.union([
  zGetTabPropsResultError,
  zBackendProjectDoesNotExistError
]);

assertTypesEqual<
  GetProjectCheckExistsResultError,
  z.infer<typeof zGetProjectCheckExistsResultError>
>({ value: true });
