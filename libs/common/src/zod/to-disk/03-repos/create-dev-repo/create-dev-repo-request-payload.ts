import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { BaseProject } from '#common/zod/backend/base-project';
import { zBaseProject } from '#common/zod/backend/base-project';

export type ToDiskCreateDevRepoRequestPayload = {
  orgId: string;
  baseProject: BaseProject;
  devRepoId: string;
  initialBranch?: string;
  sessionBranch?: string;
};

export let zToDiskCreateDevRepoRequestPayload = z
  .object({
    orgId: z.string(),
    baseProject: zBaseProject,
    devRepoId: z.string(),
    initialBranch: z.string().nullish(),
    sessionBranch: z.string().nullish()
  })
  .meta({ id: 'ToDiskCreateDevRepoRequestPayload' });

assertTypesEqual<
  ToDiskCreateDevRepoRequestPayload,
  z.infer<typeof zToDiskCreateDevRepoRequestPayload>
>({ value: true });
