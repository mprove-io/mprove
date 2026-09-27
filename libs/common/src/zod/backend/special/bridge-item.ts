import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BridgeItem = {
  orgId: string;
  projectId: string;
  repoId: string;
  branchId: string;
  envId: string;
  structId: string;
  needValidate: boolean;
  errorMessage?: string;
};

export let zBridgeItem = z
  .object({
    orgId: z.string(),
    projectId: z.string(),
    repoId: z.string(),
    branchId: z.string(),
    envId: z.string(),
    structId: z.string(),
    needValidate: z.boolean(),
    errorMessage: z.string().nullish()
  })
  .meta({ id: 'BridgeItem' });

assertTypesEqual<BridgeItem, z.infer<typeof zBridgeItem>>({ value: true });
