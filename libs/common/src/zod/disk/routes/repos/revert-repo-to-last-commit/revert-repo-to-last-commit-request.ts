import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import {
  type BaseProject,
  zBaseProject
} from '#common/zod/backend/base-project';

export type ToDiskRevertRepoToLastCommitRequest = {
  operation: 'revertRepoToLastCommit';
  traceId: string;
  input: {
    baseProject: BaseProject;
    repoId: string;
    branch: string;
  };
};

export let zToDiskRevertRepoToLastCommitRequest = z
  .strictObject({
    operation: z.literal('revertRepoToLastCommit'),
    traceId: z.string(),
    input: z
      .object({
        baseProject: zBaseProject,
        repoId: z.string(),
        branch: z.string()
      })
      .meta({ id: 'ToDiskRevertRepoToLastCommitRequestInput' })
  })
  .meta({ id: 'ToDiskRevertRepoToLastCommitRequest' });

assertTypesEqual<
  ToDiskRevertRepoToLastCommitRequest,
  z.infer<typeof zToDiskRevertRepoToLastCommitRequest>
>({ value: true });
