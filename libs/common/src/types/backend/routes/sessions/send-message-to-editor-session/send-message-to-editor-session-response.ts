import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/types/backend/response/to-backend-response-base';
import {
  type ToBackendSendMessageToEditorSessionOutput,
  zToBackendSendMessageToEditorSessionOutput
} from '#common/types/backend/routes/sessions/send-message-to-editor-session/send-message-to-editor-session-output';
import {
  type ToBackendSendMessageToEditorSessionError,
  zToBackendSendMessageToEditorSessionError
} from './send-message-to-editor-session-error';

export type ToBackendSendMessageToEditorSessionResponse = ToBackendResponseBase<
  'sendMessageToEditorSession',
  ToBackendSendMessageToEditorSessionOutput,
  ToBackendSendMessageToEditorSessionError
>;

export let zToBackendSendMessageToEditorSessionResponse =
  makeToBackendResponseSchema({
    operation: 'sendMessageToEditorSession',
    output: zToBackendSendMessageToEditorSessionOutput,
    error: zToBackendSendMessageToEditorSessionError
  }).meta({ id: 'ToBackendSendMessageToEditorSessionResponse' });

assertTypesEqual<
  ToBackendSendMessageToEditorSessionResponse,
  z.infer<typeof zToBackendSendMessageToEditorSessionResponse>
>({ value: true });
