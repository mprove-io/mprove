import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import {
  type BaseProject,
  zBaseProject
} from '#common/zod/backend/base-project';

export type ToDiskIsBranchExistRequest = {
  operation: 'isBranchExist';
  traceId: string;
  input: {
    baseProject: BaseProject;
    repoId: string;
    branch: string;
    isRemote: boolean;
  };
};

export let zToDiskIsBranchExistRequest = z
  .strictObject({
    operation: z.literal('isBranchExist'),
    traceId: z.string(),
    input: z
      .object({
        baseProject: zBaseProject,
        repoId: z.string(),
        branch: z.string(),
        isRemote: z.boolean()
      })
      .meta({ id: 'ToDiskIsBranchExistRequestInput' })
  })
  .meta({ id: 'ToDiskIsBranchExistRequest' });

assertTypesEqual<
  ToDiskIsBranchExistRequest,
  z.infer<typeof zToDiskIsBranchExistRequest>
>({ value: true });
