import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/zod/backend/response/to-backend-response-base';
import {
  type ToBackendSaveFileOutput,
  zToBackendSaveFileOutput
} from '#common/zod/backend/routes/files/save-file/save-file-output';
import {
  type ToBackendSaveFileError,
  zToBackendSaveFileError
} from './save-file-error';

export type ToBackendSaveFileResponse = ToBackendResponseBase<
  'saveFile',
  ToBackendSaveFileOutput,
  ToBackendSaveFileError
>;

export let zToBackendSaveFileResponse = makeToBackendResponseSchema({
  operation: 'saveFile',
  output: zToBackendSaveFileOutput,
  error: zToBackendSaveFileError
}).meta({ id: 'ToBackendSaveFileResponse' });

assertTypesEqual<
  ToBackendSaveFileResponse,
  z.infer<typeof zToBackendSaveFileResponse>
>({ value: true });
