import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { BaseProject } from '#common/zod/backend/base-project';
import { zBaseProject } from '#common/zod/backend/base-project';

export type ToDiskSyncRepoBaseRequestPayload = {
  orgId: string;
  baseProject: BaseProject;
  repoId: string;
  branch: string;
  lastCommit: string;
  getRepo?: boolean;
  getRepoNodes?: boolean;
};

export let zToDiskSyncRepoBaseRequestPayload = z.object({
  orgId: z.string(),
  baseProject: zBaseProject,
  repoId: z.string(),
  branch: z.string(),
  lastCommit: z.string(),
  getRepo: z.boolean().nullish(),
  getRepoNodes: z.boolean().nullish()
});

assertTypesEqual<
  ToDiskSyncRepoBaseRequestPayload,
  z.infer<typeof zToDiskSyncRepoBaseRequestPayload>
>({ value: true });
