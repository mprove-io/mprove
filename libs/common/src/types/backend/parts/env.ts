import { z } from 'zod';
import { zEnvUser } from '#common/types/backend/parts/env-user';
import { zEv } from '#common/types/backend/parts/ev';

export let zEnv = z
  .object({
    envId: z.string(),
    projectId: z.string(),
    envUsers: z.array(zEnvUser),
    isFallbackToProdConnections: z.boolean(),
    isFallbackToProdVariables: z.boolean(),
    useProdCache: z.boolean(),
    envConnectionIds: z.array(z.string()),
    envConnectionIdsWithFallback: z.array(z.string()),
    fallbackConnectionIds: z.array(z.string()),
    evs: z.array(zEv),
    evsWithFallback: z.array(zEv),
    fallbackEvIds: z.array(z.string())
  })
  .meta({ id: 'Env' });

export type Env = z.infer<typeof zEnv>;
