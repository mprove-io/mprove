import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BranchSt = {
  emptyData?: number;
};

export let zBranchSt = z
  .object({ emptyData: z.number().nullish() })
  .meta({ id: 'BranchSt' });

assertTypesEqual<BranchSt, z.infer<typeof zBranchSt>>({ value: true });
