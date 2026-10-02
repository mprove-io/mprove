import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/types/backend/response/to-backend-response-base';
import {
  type ToBackendArchiveSessionOutput,
  zToBackendArchiveSessionOutput
} from '#common/types/backend/routes/sessions/archive-session/archive-session-output';
import {
  type ToBackendArchiveSessionError,
  zToBackendArchiveSessionError
} from './archive-session-error';

export type ToBackendArchiveSessionResponse = ToBackendResponseBase<
  'archiveSession',
  ToBackendArchiveSessionOutput,
  ToBackendArchiveSessionError
>;

export let zToBackendArchiveSessionResponse = makeToBackendResponseSchema({
  operation: 'archiveSession',
  output: zToBackendArchiveSessionOutput,
  error: zToBackendArchiveSessionError
}).meta({ id: 'ToBackendArchiveSessionResponse' });

assertTypesEqual<
  ToBackendArchiveSessionResponse,
  z.infer<typeof zToBackendArchiveSessionResponse>
>({ value: true });
