import type { Message } from '@opencode-ai/sdk/v2';
import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type SessionMessageApi = {
  messageId: string;
  sessionId: string;
  role: string;
  ocMessage: Message;
};

export let zSessionMessageApi = z
  .object({
    messageId: z.string(),
    sessionId: z.string(),
    role: z.string(),
    ocMessage: z.custom<Message>()
  })
  .meta({ id: 'SessionMessageApi' });

assertTypesEqual<SessionMessageApi, z.infer<typeof zSessionMessageApi>>({
  value: true
});
