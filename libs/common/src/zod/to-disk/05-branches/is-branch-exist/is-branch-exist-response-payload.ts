import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';

export type ToDiskIsBranchExistResponsePayload = {
  orgId: string;
  projectId: string;
  repoId: string;
  branch: string;
  isRemote: boolean;
  isBranchExist: boolean;
};

export let zToDiskIsBranchExistResponsePayload = z
  .object({
    orgId: z.string(),
    projectId: z.string(),
    repoId: z.string(),
    branch: z.string(),
    isRemote: z.boolean(),
    isBranchExist: z.boolean()
  })
  .meta({ id: 'ToDiskIsBranchExistResponsePayload' });

assertTypesEqual<
  ToDiskIsBranchExistResponsePayload,
  z.infer<typeof zToDiskIsBranchExistResponsePayload>
>({ value: true });
