import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/types/backend/response/to-backend-response-base';
import {
  type ToBackendCreateFolderOutput,
  zToBackendCreateFolderOutput
} from '#common/types/backend/routes/folders/create-folder/create-folder-output';
import {
  type ToBackendCreateFolderError,
  zToBackendCreateFolderError
} from './create-folder-error';

export type ToBackendCreateFolderResponse = ToBackendResponseBase<
  'createFolder',
  ToBackendCreateFolderOutput,
  ToBackendCreateFolderError
>;

export let zToBackendCreateFolderResponse = makeToBackendResponseSchema({
  operation: 'createFolder',
  output: zToBackendCreateFolderOutput,
  error: zToBackendCreateFolderError
}).meta({ id: 'ToBackendCreateFolderResponse' });

assertTypesEqual<
  ToBackendCreateFolderResponse,
  z.infer<typeof zToBackendCreateFolderResponse>
>({ value: true });
