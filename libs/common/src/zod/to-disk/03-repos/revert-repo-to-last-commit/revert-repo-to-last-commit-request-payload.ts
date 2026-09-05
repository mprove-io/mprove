import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { BaseProject } from '#common/zod/backend/base-project';
import { zBaseProject } from '#common/zod/backend/base-project';

export type ToDiskRevertRepoToLastCommitRequestPayload = {
  orgId: string;
  baseProject: BaseProject;
  repoId: string;
  branch: string;
};

export let zToDiskRevertRepoToLastCommitRequestPayload = z
  .object({
    orgId: z.string(),
    baseProject: zBaseProject,
    repoId: z.string(),
    branch: z.string()
  })
  .meta({ id: 'ToDiskRevertRepoToLastCommitRequestPayload' });

assertTypesEqual<
  ToDiskRevertRepoToLastCommitRequestPayload,
  z.infer<typeof zToDiskRevertRepoToLastCommitRequestPayload>
>({ value: true });
