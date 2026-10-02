import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/types/backend/response/to-backend-response-base';
import {
  type ToBackendSendMessageToExplorerSessionOutput,
  zToBackendSendMessageToExplorerSessionOutput
} from '#common/types/backend/routes/sessions/send-message-to-explorer-session/send-message-to-explorer-session-output';
import {
  type ToBackendSendMessageToExplorerSessionError,
  zToBackendSendMessageToExplorerSessionError
} from './send-message-to-explorer-session-error';

export type ToBackendSendMessageToExplorerSessionResponse =
  ToBackendResponseBase<
    'sendMessageToExplorerSession',
    ToBackendSendMessageToExplorerSessionOutput,
    ToBackendSendMessageToExplorerSessionError
  >;

export let zToBackendSendMessageToExplorerSessionResponse =
  makeToBackendResponseSchema({
    operation: 'sendMessageToExplorerSession',
    output: zToBackendSendMessageToExplorerSessionOutput,
    error: zToBackendSendMessageToExplorerSessionError
  }).meta({ id: 'ToBackendSendMessageToExplorerSessionResponse' });

assertTypesEqual<
  ToBackendSendMessageToExplorerSessionResponse,
  z.infer<typeof zToBackendSendMessageToExplorerSessionResponse>
>({ value: true });
