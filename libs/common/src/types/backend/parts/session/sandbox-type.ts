import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export const sandboxTypeValues = ['E2B'] as const;

export type SandboxType = (typeof sandboxTypeValues)[number];

export let zSandboxType = z.enum(sandboxTypeValues);

assertTypesEqual<SandboxType, z.infer<typeof zSandboxType>>({
  value: true
});
