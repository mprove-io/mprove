import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { BaseProject } from '#common/zod/backend/base-project';
import { zBaseProject } from '#common/zod/backend/base-project';

export type ToDiskCreateProjectRequestPayload = {
  orgId: string;
  baseProject: BaseProject;
  seedProjectId?: string;
  devRepoId: string;
  userAlias: string;
};

export let zToDiskCreateProjectRequestPayload = z
  .object({
    orgId: z.string(),
    baseProject: zBaseProject,
    seedProjectId: z.string().nullish(),
    devRepoId: z.string(),
    userAlias: z.string()
  })
  .meta({ id: 'ToDiskCreateProjectRequestPayload' });

assertTypesEqual<
  ToDiskCreateProjectRequestPayload,
  z.infer<typeof zToDiskCreateProjectRequestPayload>
>({ value: true });
