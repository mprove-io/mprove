import { z } from 'zod';

export let zCodexAuthOpenai = z
  .object({
    type: z.literal('oauth'),
    refresh: z.string(),
    expires: z.number(),
    access: z.string().nullish(),
    accountId: z.string().nullish()
  })
  .meta({ id: 'CodexAuthOpenai' });

export type CodexAuthOpenai = z.infer<typeof zCodexAuthOpenai>;

export let zCodexAuth = z
  .object({
    openai: zCodexAuthOpenai
  })
  .meta({ id: 'CodexAuth' });

export type CodexAuth = z.infer<typeof zCodexAuth>;
