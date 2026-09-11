import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import {
  type BaseProject,
  zBaseProject
} from '#common/zod/backend/base-project';

export type ToDiskDeleteBranchRequest = {
  operation: 'deleteBranch';
  traceId: string;
  input: {
    baseProject: BaseProject;
    repoId: string;
    branch: string;
  };
};

export let zToDiskDeleteBranchRequest = z
  .strictObject({
    operation: z.literal('deleteBranch'),
    traceId: z.string(),
    input: z
      .object({
        baseProject: zBaseProject,
        repoId: z.string(),
        branch: z.string()
      })
      .meta({ id: 'ToDiskDeleteBranchRequestInput' })
  })
  .meta({ id: 'ToDiskDeleteBranchRequest' });

assertTypesEqual<
  ToDiskDeleteBranchRequest,
  z.infer<typeof zToDiskDeleteBranchRequest>
>({ value: true });
