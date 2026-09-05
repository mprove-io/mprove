import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { BaseProject } from '#common/zod/backend/base-project';
import { zBaseProject } from '#common/zod/backend/base-project';

export type ToDiskCreateFileRequestPayload = {
  orgId: string;
  baseProject: BaseProject;
  repoId: string;
  branch: string;
  userAlias: string;
  parentNodeId: string;
  fileName: string;
  fileText?: string;
};

export let zToDiskCreateFileRequestPayload = z
  .object({
    orgId: z.string(),
    baseProject: zBaseProject,
    repoId: z.string(),
    branch: z.string(),
    userAlias: z.string(),
    parentNodeId: z.string(),
    fileName: z.string(),
    fileText: z.string().nullish()
  })
  .meta({ id: 'ToDiskCreateFileRequestPayload' });

assertTypesEqual<
  ToDiskCreateFileRequestPayload,
  z.infer<typeof zToDiskCreateFileRequestPayload>
>({ value: true });
