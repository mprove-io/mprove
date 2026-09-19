import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import {
  type BaseProject,
  zBaseProject
} from '#common/zod/backend/base-project';

export type ToDiskRevertRepoToRemoteRequest = {
  operation: 'revertRepoToRemote';
  traceId: string;
  input: {
    baseProject: BaseProject;
    repoId: string;
    branch: string;
  };
};

export let zToDiskRevertRepoToRemoteRequest = z
  .strictObject({
    operation: z.literal('revertRepoToRemote'),
    traceId: z.string(),
    input: z
      .object({
        baseProject: zBaseProject,
        repoId: z.string(),
        branch: z.string()
      })
      .meta({ id: 'ToDiskRevertRepoToRemoteRequestInput' })
  })
  .meta({ id: 'ToDiskRevertRepoToRemoteRequest' });

assertTypesEqual<
  ToDiskRevertRepoToRemoteRequest,
  z.infer<typeof zToDiskRevertRepoToRemoteRequest>
>({ value: true });
