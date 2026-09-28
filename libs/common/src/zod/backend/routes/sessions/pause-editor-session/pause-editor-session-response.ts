import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/zod/backend/response/to-backend-response-base';
import {
  type ToBackendPauseEditorSessionOutput,
  zToBackendPauseEditorSessionOutput
} from '#common/zod/backend/routes/sessions/pause-editor-session/pause-editor-session-output';
import {
  type ToBackendPauseEditorSessionError,
  zToBackendPauseEditorSessionError
} from './pause-editor-session-error';

export type ToBackendPauseEditorSessionResponse = ToBackendResponseBase<
  'pauseEditorSession',
  ToBackendPauseEditorSessionOutput,
  ToBackendPauseEditorSessionError
>;

export let zToBackendPauseEditorSessionResponse = makeToBackendResponseSchema({
  operation: 'pauseEditorSession',
  output: zToBackendPauseEditorSessionOutput,
  error: zToBackendPauseEditorSessionError
}).meta({ id: 'ToBackendPauseEditorSessionResponse' });

assertTypesEqual<
  ToBackendPauseEditorSessionResponse,
  z.infer<typeof zToBackendPauseEditorSessionResponse>
>({ value: true });
