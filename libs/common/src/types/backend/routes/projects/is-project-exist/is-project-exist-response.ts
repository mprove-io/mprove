import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/types/backend/response/to-backend-response-base';
import {
  type ToBackendIsProjectExistOutput,
  zToBackendIsProjectExistOutput
} from '#common/types/backend/routes/projects/is-project-exist/is-project-exist-output';
import {
  type ToBackendIsProjectExistError,
  zToBackendIsProjectExistError
} from './is-project-exist-error';

export type ToBackendIsProjectExistResponse = ToBackendResponseBase<
  'isProjectExist',
  ToBackendIsProjectExistOutput,
  ToBackendIsProjectExistError
>;

export let zToBackendIsProjectExistResponse = makeToBackendResponseSchema({
  operation: 'isProjectExist',
  output: zToBackendIsProjectExistOutput,
  error: zToBackendIsProjectExistError
}).meta({ id: 'ToBackendIsProjectExistResponse' });

assertTypesEqual<
  ToBackendIsProjectExistResponse,
  z.infer<typeof zToBackendIsProjectExistResponse>
>({ value: true });
