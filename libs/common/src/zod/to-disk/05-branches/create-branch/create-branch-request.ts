import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import {
  type BaseProject,
  zBaseProject
} from '#common/zod/backend/base-project';

export type ToDiskCreateBranchRequest = {
  operation: 'createBranch';
  traceId: string;
  input: {
    baseProject: BaseProject;
    repoId: string;
    newBranch: string;
    fromBranch: string;
    isFromRemote: boolean;
  };
};

export let zToDiskCreateBranchRequest = z
  .strictObject({
    operation: z.literal('createBranch'),
    traceId: z.string(),
    input: z
      .object({
        baseProject: zBaseProject,
        repoId: z.string(),
        newBranch: z.string(),
        fromBranch: z.string(),
        isFromRemote: z.boolean()
      })
      .meta({ id: 'ToDiskCreateBranchRequestInput' })
  })
  .meta({ id: 'ToDiskCreateBranchRequest' });

assertTypesEqual<
  ToDiskCreateBranchRequest,
  z.infer<typeof zToDiskCreateBranchRequest>
>({ value: true });
