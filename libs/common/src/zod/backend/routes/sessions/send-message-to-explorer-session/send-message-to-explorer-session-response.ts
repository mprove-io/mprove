import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import { type SessionApi, zSessionApi } from '#common/zod/backend/session-api';
import {
  type ToBackendSendMessageToExplorerSessionError,
  zToBackendSendMessageToExplorerSessionError
} from './send-message-to-explorer-session-error';

export type ToBackendSendMessageToExplorerSessionOutput = {
  session: SessionApi;
};

export type ToBackendSendMessageToExplorerSessionResponse = ToBackendResponse<
  ToBackendSendMessageToExplorerSessionOutput,
  ToBackendSendMessageToExplorerSessionError
>;

export let zToBackendSendMessageToExplorerSessionOutput = z
  .object({
    session: zSessionApi
  })
  .meta({ id: 'ToBackendSendMessageToExplorerSessionOutput' });

export let zToBackendSendMessageToExplorerSessionResponse =
  makeToBackendResponseSchema({
    success: zToBackendSendMessageToExplorerSessionOutput,
    error: zToBackendSendMessageToExplorerSessionError
  }).meta({ id: 'ToBackendSendMessageToExplorerSessionResponse' });

assertTypesEqual<
  ToBackendSendMessageToExplorerSessionOutput,
  z.infer<typeof zToBackendSendMessageToExplorerSessionOutput>
>({ value: true });

assertTypesEqual<
  ToBackendSendMessageToExplorerSessionResponse,
  z.infer<typeof zToBackendSendMessageToExplorerSessionResponse>
>({ value: true });
