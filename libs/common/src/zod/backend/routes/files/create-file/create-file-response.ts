import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/zod/backend/response/to-backend-response-base';
import {
  type ToBackendCreateFileOutput,
  zToBackendCreateFileOutput
} from '#common/zod/backend/routes/files/create-file/create-file-output';
import {
  type ToBackendCreateFileError,
  zToBackendCreateFileError
} from './create-file-error';

export type ToBackendCreateFileResponse = ToBackendResponseBase<
  'createFile',
  ToBackendCreateFileOutput,
  ToBackendCreateFileError
>;

export let zToBackendCreateFileResponse = makeToBackendResponseSchema({
  operation: 'createFile',
  output: zToBackendCreateFileOutput,
  error: zToBackendCreateFileError
}).meta({ id: 'ToBackendCreateFileResponse' });

assertTypesEqual<
  ToBackendCreateFileResponse,
  z.infer<typeof zToBackendCreateFileResponse>
>({ value: true });
