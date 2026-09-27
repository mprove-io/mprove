import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import { type SessionApi, zSessionApi } from '#common/zod/backend/session-api';
import {
  type ToBackendSendMessageToEditorSessionError,
  zToBackendSendMessageToEditorSessionError
} from './send-message-to-editor-session-error';

export type ToBackendSendMessageToEditorSessionOutput = {
  session: SessionApi;
};

export type ToBackendSendMessageToEditorSessionResponse = ToBackendResponse<
  ToBackendSendMessageToEditorSessionOutput,
  ToBackendSendMessageToEditorSessionError
>;

export let zToBackendSendMessageToEditorSessionOutput = z
  .object({
    session: zSessionApi
  })
  .meta({ id: 'ToBackendSendMessageToEditorSessionOutput' });

export let zToBackendSendMessageToEditorSessionResponse =
  makeToBackendResponseSchema({
    success: zToBackendSendMessageToEditorSessionOutput,
    error: zToBackendSendMessageToEditorSessionError
  }).meta({ id: 'ToBackendSendMessageToEditorSessionResponse' });

assertTypesEqual<
  ToBackendSendMessageToEditorSessionOutput,
  z.infer<typeof zToBackendSendMessageToEditorSessionOutput>
>({ value: true });

assertTypesEqual<
  ToBackendSendMessageToEditorSessionResponse,
  z.infer<typeof zToBackendSendMessageToEditorSessionResponse>
>({ value: true });
