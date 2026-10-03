import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type EnvUser, zEnvUser } from '#common/types/backend/parts/env-user';
import { type Ev, zEv } from '#common/types/backend/parts/ev';

export type Env = {
  envId: string;
  projectId: string;
  envUsers: EnvUser[];
  isFallbackToProdConnections: boolean;
  isFallbackToProdVariables: boolean;
  useProdCache: boolean;
  envConnectionIds: string[];
  envConnectionIdsWithFallback: string[];
  fallbackConnectionIds: string[];
  evs: Ev[];
  evsWithFallback: Ev[];
  fallbackEvIds: string[];
};

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

assertTypesEqual<Env, z.infer<typeof zEnv>>({ value: true });
