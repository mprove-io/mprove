import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { BaseProject } from '#common/zod/backend/base-project';
import { zBaseProject } from '#common/zod/backend/base-project';

export type ToDiskRevertRepoToRemoteRequestPayload = {
  orgId: string;
  baseProject: BaseProject;
  repoId: string;
  branch: string;
};

export let zToDiskRevertRepoToRemoteRequestPayload = z
  .object({
    orgId: z.string(),
    baseProject: zBaseProject,
    repoId: z.string(),
    branch: z.string()
  })
  .meta({ id: 'ToDiskRevertRepoToRemoteRequestPayload' });

assertTypesEqual<
  ToDiskRevertRepoToRemoteRequestPayload,
  z.infer<typeof zToDiskRevertRepoToRemoteRequestPayload>
>({ value: true });
