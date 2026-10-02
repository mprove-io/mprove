import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type SessionApi,
  zSessionApi
} from '#common/types/backend/parts/session-api';

export type ToBackendSendMessageToEditorSessionOutput = {
  session: SessionApi;
};

export let zToBackendSendMessageToEditorSessionOutput = z
  .object({
    session: zSessionApi
  })
  .meta({ id: 'ToBackendSendMessageToEditorSessionOutput' });

assertTypesEqual<
  ToBackendSendMessageToEditorSessionOutput,
  z.infer<typeof zToBackendSendMessageToEditorSessionOutput>
>({ value: true });
