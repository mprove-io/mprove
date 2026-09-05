import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import {
  type BaseProject,
  zBaseProject
} from '#common/zod/backend/base-project';

export type ToDiskIsBranchExistRequestPayload = {
  orgId: string;
  baseProject: BaseProject;
  repoId: string;
  branch: string;
  isRemote: boolean;
};

export let zToDiskIsBranchExistRequestPayload = z
  .object({
    orgId: z.string(),
    baseProject: zBaseProject,
    repoId: z.string(),
    branch: z.string(),
    isRemote: z.boolean()
  })
  .meta({ id: 'ToDiskIsBranchExistRequestPayload' });

assertTypesEqual<
  ToDiskIsBranchExistRequestPayload,
  z.infer<typeof zToDiskIsBranchExistRequestPayload>
>({ value: true });
