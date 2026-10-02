import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToDiskIsBranchExistOutput = {
  orgId: string;
  projectId: string;
  repoId: string;
  branch: string;
  isRemote: boolean;
  isBranchExist: boolean;
};

export let zToDiskIsBranchExistOutput = z
  .object({
    orgId: z.string(),
    projectId: z.string(),
    repoId: z.string(),
    branch: z.string(),
    isRemote: z.boolean(),
    isBranchExist: z.boolean()
  })
  .meta({ id: 'ToDiskIsBranchExistOutput' });

assertTypesEqual<
  ToDiskIsBranchExistOutput,
  z.infer<typeof zToDiskIsBranchExistOutput>
>({ value: true });
