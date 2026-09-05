import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import {
  type BaseProject,
  zBaseProject
} from '#common/zod/backend/base-project';

export type ToDiskCreateBranchRequestPayload = {
  orgId: string;
  baseProject: BaseProject;
  repoId: string;
  newBranch: string;
  fromBranch: string;
  isFromRemote: boolean;
};

export let zToDiskCreateBranchRequestPayload = z
  .object({
    orgId: z.string(),
    baseProject: zBaseProject,
    repoId: z.string(),
    newBranch: z.string(),
    fromBranch: z.string(),
    isFromRemote: z.boolean()
  })
  .meta({ id: 'ToDiskCreateBranchRequestPayload' });

assertTypesEqual<
  ToDiskCreateBranchRequestPayload,
  z.infer<typeof zToDiskCreateBranchRequestPayload>
>({ value: true });
