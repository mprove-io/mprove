import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type SessionApi,
  zSessionApi
} from '#common/types/backend/session-api';

export type ToBackendSendMessageToExplorerSessionOutput = {
  session: SessionApi;
};

export let zToBackendSendMessageToExplorerSessionOutput = z
  .object({
    session: zSessionApi
  })
  .meta({ id: 'ToBackendSendMessageToExplorerSessionOutput' });

assertTypesEqual<
  ToBackendSendMessageToExplorerSessionOutput,
  z.infer<typeof zToBackendSendMessageToExplorerSessionOutput>
>({ value: true });
