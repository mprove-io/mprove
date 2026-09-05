import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { BaseProject } from '#common/zod/backend/base-project';
import { zBaseProject } from '#common/zod/backend/base-project';

export type ToDiskPushRepoRequestPayload = {
  orgId: string;
  baseProject: BaseProject;
  repoId: string;
  branch: string;
  userAlias: string;
};

export let zToDiskPushRepoRequestPayload = z
  .object({
    orgId: z.string(),
    baseProject: zBaseProject,
    repoId: z.string(),
    branch: z.string(),
    userAlias: z.string()
  })
  .meta({ id: 'ToDiskPushRepoRequestPayload' });

assertTypesEqual<
  ToDiskPushRepoRequestPayload,
  z.infer<typeof zToDiskPushRepoRequestPayload>
>({ value: true });
