import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/zod/backend/response/to-backend-response-base';
import {
  type ToBackendDeleteFileOutput,
  zToBackendDeleteFileOutput
} from '#common/zod/backend/routes/files/delete-file/delete-file-output';
import {
  type ToBackendDeleteFileError,
  zToBackendDeleteFileError
} from './delete-file-error';

export type ToBackendDeleteFileResponse = ToBackendResponseBase<
  'deleteFile',
  ToBackendDeleteFileOutput,
  ToBackendDeleteFileError
>;

export let zToBackendDeleteFileResponse = makeToBackendResponseSchema({
  operation: 'deleteFile',
  output: zToBackendDeleteFileOutput,
  error: zToBackendDeleteFileError
}).meta({ id: 'ToBackendDeleteFileResponse' });

assertTypesEqual<
  ToBackendDeleteFileResponse,
  z.infer<typeof zToBackendDeleteFileResponse>
>({ value: true });
