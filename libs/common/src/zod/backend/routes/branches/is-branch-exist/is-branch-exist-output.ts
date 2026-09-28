import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendIsBranchExistOutput = {
  isExist: boolean;
};

export let zToBackendIsBranchExistOutput = z
  .object({
    isExist: z.boolean()
  })
  .meta({ id: 'ToBackendIsBranchExistOutput' });

assertTypesEqual<
  ToBackendIsBranchExistOutput,
  z.infer<typeof zToBackendIsBranchExistOutput>
>({ value: true });
