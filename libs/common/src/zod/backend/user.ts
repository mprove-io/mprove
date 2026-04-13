import { z } from 'zod';
import { zUi } from '#common/zod/backend/ui';

export let zUser = z
  .object({
    userId: z.string(),
    email: z.string(),
    alias: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    isEmailVerified: z.boolean(),
    ui: zUi,
    apiKeyPrefix: z.string().nullish(),
    isCodexAuthSet: z.boolean().nullish(),
    codexAuthUpdateTs: z.number().int().nullish(),
    codexAuthExpiresTs: z.number().int().nullish(),
    serverTs: z.number().int()
  })
  .meta({ id: 'User' });

export type ZUser = z.infer<typeof zUser>;
