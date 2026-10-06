import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export const blockmlEnvValues = ['DEV', 'PROD', 'TEST'] as const;

export type BlockmlEnv = (typeof blockmlEnvValues)[number];

export let zBlockmlEnv = z.enum(blockmlEnvValues);

assertTypesEqual<BlockmlEnv, z.infer<typeof zBlockmlEnv>>({
  value: true
});
