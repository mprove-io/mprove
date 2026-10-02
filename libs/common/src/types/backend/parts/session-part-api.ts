import type { Part } from '@opencode-ai/sdk/v2';
import { z } from 'zod';

export let zSessionPartApi = z
  .object({
    partId: z.string(),
    messageId: z.string(),
    sessionId: z.string(),
    ocPart: z.custom<Part>()
  })
  .meta({ id: 'SessionPartApi' });

export type SessionPartApi = z.infer<typeof zSessionPartApi>;
