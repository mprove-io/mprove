import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/types/backend/response/to-backend-response-base';
import {
  type ToBackendCreateEditorSessionOutput,
  zToBackendCreateEditorSessionOutput
} from '#common/types/backend/routes/sessions/create-editor-session/create-editor-session-output';
import {
  type ToBackendCreateEditorSessionError,
  zToBackendCreateEditorSessionError
} from './create-editor-session-error';

export type ToBackendCreateEditorSessionResponse = ToBackendResponseBase<
  'createEditorSession',
  ToBackendCreateEditorSessionOutput,
  ToBackendCreateEditorSessionError
>;

export let zToBackendCreateEditorSessionResponse = makeToBackendResponseSchema({
  operation: 'createEditorSession',
  output: zToBackendCreateEditorSessionOutput,
  error: zToBackendCreateEditorSessionError
}).meta({ id: 'ToBackendCreateEditorSessionResponse' });

assertTypesEqual<
  ToBackendCreateEditorSessionResponse,
  z.infer<typeof zToBackendCreateEditorSessionResponse>
>({ value: true });
