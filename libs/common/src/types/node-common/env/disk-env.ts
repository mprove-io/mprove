import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

const diskEnvValues = ['DEV', 'PROD', 'TEST'] as const;

export type DiskEnv = (typeof diskEnvValues)[number];

export let zDiskEnv = z.enum(diskEnvValues);

assertTypesEqual<DiskEnv, z.infer<typeof zDiskEnv>>({
  value: true
});
