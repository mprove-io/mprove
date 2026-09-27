import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import {
  type ToBackendIsProjectExistError,
  zToBackendIsProjectExistError
} from './is-project-exist-error';

export type ToBackendIsProjectExistOutput = {
  isExist: boolean;
};

export type ToBackendIsProjectExistResponse = ToBackendResponse<
  ToBackendIsProjectExistOutput,
  ToBackendIsProjectExistError
>;

export let zToBackendIsProjectExistOutput = z
  .object({
    isExist: z.boolean()
  })
  .meta({ id: 'ToBackendIsProjectExistOutput' });

export let zToBackendIsProjectExistResponse = makeToBackendResponseSchema({
  success: zToBackendIsProjectExistOutput,
  error: zToBackendIsProjectExistError
}).meta({ id: 'ToBackendIsProjectExistResponse' });

assertTypesEqual<
  ToBackendIsProjectExistOutput,
  z.infer<typeof zToBackendIsProjectExistOutput>
>({ value: true });

assertTypesEqual<
  ToBackendIsProjectExistResponse,
  z.infer<typeof zToBackendIsProjectExistResponse>
>({ value: true });
