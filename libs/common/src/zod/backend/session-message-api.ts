import type { Message } from '@opencode-ai/sdk/v2';
import { z } from 'zod';

export let zSessionMessageApi = z
  .object({
    messageId: z.string(),
    sessionId: z.string(),
    role: z.string(),
    ocMessage: z.custom<Message>()
  })
  .meta({ id: 'SessionMessageApi' });

export type SessionMessageApi = z.infer<typeof zSessionMessageApi>;
