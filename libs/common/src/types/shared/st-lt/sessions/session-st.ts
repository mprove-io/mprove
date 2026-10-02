import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type SessionSt = {
  sandboxId?: string;
  sandboxBaseUrl?: string;
  opencodeSessionId?: string;
  opencodePassword?: string;
  firstMessage?: string;
  apiKeySecretHash?: string;
  apiKeySalt?: string;
  providerConfigHash?: string;
  closedExplorerTabIds?: string[];
};

export let zSessionSt = z
  .object({
    sandboxId: z.string().nullish(),
    sandboxBaseUrl: z.string().nullish(),
    opencodeSessionId: z.string().nullish(),
    opencodePassword: z.string().nullish(),
    firstMessage: z.string().nullish(),
    apiKeySecretHash: z.string().nullish(),
    apiKeySalt: z.string().nullish(),
    providerConfigHash: z.string().nullish(),
    closedExplorerTabIds: z.array(z.string()).nullish()
  })
  .meta({ id: 'SessionSt' });

assertTypesEqual<SessionSt, z.infer<typeof zSessionSt>>({ value: true });
