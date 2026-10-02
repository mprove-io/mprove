import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/types/backend/response/to-backend-response-base';
import {
  type ToBackendDeleteFolderOutput,
  zToBackendDeleteFolderOutput
} from '#common/types/backend/routes/folders/delete-folder/delete-folder-output';
import {
  type ToBackendDeleteFolderError,
  zToBackendDeleteFolderError
} from './delete-folder-error';

export type ToBackendDeleteFolderResponse = ToBackendResponseBase<
  'deleteFolder',
  ToBackendDeleteFolderOutput,
  ToBackendDeleteFolderError
>;

export let zToBackendDeleteFolderResponse = makeToBackendResponseSchema({
  operation: 'deleteFolder',
  output: zToBackendDeleteFolderOutput,
  error: zToBackendDeleteFolderError
}).meta({ id: 'ToBackendDeleteFolderResponse' });

assertTypesEqual<
  ToBackendDeleteFolderResponse,
  z.infer<typeof zToBackendDeleteFolderResponse>
>({ value: true });
