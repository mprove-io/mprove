import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { BaseProject } from '#common/zod/backend/base-project';
import { zBaseProject } from '#common/zod/backend/base-project';

export type ToDiskDeleteDevRepoRequestPayload = {
  orgId: string;
  projectId: string;
  baseProject: BaseProject;
  devRepoId: string;
};

export let zToDiskDeleteDevRepoRequestPayload = z
  .object({
    orgId: z.string(),
    projectId: z.string(),
    baseProject: zBaseProject,
    devRepoId: z.string()
  })
  .meta({ id: 'ToDiskDeleteDevRepoRequestPayload' });

assertTypesEqual<
  ToDiskDeleteDevRepoRequestPayload,
  z.infer<typeof zToDiskDeleteDevRepoRequestPayload>
>({ value: true });
