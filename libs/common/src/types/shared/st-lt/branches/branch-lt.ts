import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BranchLt = {
  emptyData?: number;
};

export let zBranchLt = z
  .object({ emptyData: z.number().nullish() })
  .meta({ id: 'BranchLt' });

assertTypesEqual<BranchLt, z.infer<typeof zBranchLt>>({ value: true });
