import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/types/backend/response/to-backend-response-base';
import {
  type ToBackendGetFileOutput,
  zToBackendGetFileOutput
} from '#common/types/backend/routes/files/get-file/get-file-output';
import {
  type ToBackendGetFileError,
  zToBackendGetFileError
} from './get-file-error';

export type ToBackendGetFileResponse = ToBackendResponseBase<
  'getFile',
  ToBackendGetFileOutput,
  ToBackendGetFileError
>;

export let zToBackendGetFileResponse = makeToBackendResponseSchema({
  operation: 'getFile',
  output: zToBackendGetFileOutput,
  error: zToBackendGetFileError
}).meta({ id: 'ToBackendGetFileResponse' });

assertTypesEqual<
  ToBackendGetFileResponse,
  z.infer<typeof zToBackendGetFileResponse>
>({ value: true });
