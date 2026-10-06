import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export const backendEnvValues = ['DEV', 'PROD', 'TEST'] as const;

export type BackendEnv = (typeof backendEnvValues)[number];

export let zBackendEnv = z.enum(backendEnvValues);

assertTypesEqual<BackendEnv, z.infer<typeof zBackendEnv>>({
  value: true
});
