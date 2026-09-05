import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import {
  type BaseProject,
  zBaseProject
} from '#common/zod/backend/base-project';

export type ToDiskDeleteBranchRequestPayload = {
  orgId: string;
  baseProject: BaseProject;
  repoId: string;
  branch: string;
};

export let zToDiskDeleteBranchRequestPayload = z
  .object({
    orgId: z.string(),
    baseProject: zBaseProject,
    repoId: z.string(),
    branch: z.string()
  })
  .meta({ id: 'ToDiskDeleteBranchRequestPayload' });

assertTypesEqual<
  ToDiskDeleteBranchRequestPayload,
  z.infer<typeof zToDiskDeleteBranchRequestPayload>
>({ value: true });
