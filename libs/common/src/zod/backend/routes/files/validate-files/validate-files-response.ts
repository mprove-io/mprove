import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/zod/backend/response/to-backend-response-base';
import {
  type ToBackendValidateFilesOutput,
  zToBackendValidateFilesOutput
} from '#common/zod/backend/routes/files/validate-files/validate-files-output';
import {
  type ToBackendValidateFilesError,
  zToBackendValidateFilesError
} from './validate-files-error';

export type ToBackendValidateFilesResponse = ToBackendResponseBase<
  'validateFiles',
  ToBackendValidateFilesOutput,
  ToBackendValidateFilesError
>;

export let zToBackendValidateFilesResponse = makeToBackendResponseSchema({
  operation: 'validateFiles',
  output: zToBackendValidateFilesOutput,
  error: zToBackendValidateFilesError
}).meta({ id: 'ToBackendValidateFilesResponse' });

assertTypesEqual<
  ToBackendValidateFilesResponse,
  z.infer<typeof zToBackendValidateFilesResponse>
>({ value: true });
