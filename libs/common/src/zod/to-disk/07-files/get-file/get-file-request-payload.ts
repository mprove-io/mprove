import { z } from 'zod';
import { BuilderLeftEnum } from '#common/enums/builder-left.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { BaseProject } from '#common/zod/backend/base-project';
import { zBaseProject } from '#common/zod/backend/base-project';

export type ToDiskGetFileRequestPayload = {
  orgId: string;
  baseProject: BaseProject;
  repoId: string;
  branch: string;
  fileNodeId: string;
  builderLeft:
    | BuilderLeftEnum.Tree
    | BuilderLeftEnum.ChangesToCommit
    | BuilderLeftEnum.ChangesToPush
    | BuilderLeftEnum.Info;
};

export let zToDiskGetFileRequestPayload = z
  .object({
    orgId: z.string(),
    baseProject: zBaseProject,
    repoId: z.string(),
    branch: z.string(),
    fileNodeId: z.string(),
    builderLeft: z.enum(BuilderLeftEnum)
  })
  .meta({ id: 'ToDiskGetFileRequestPayload' });

assertTypesEqual<
  ToDiskGetFileRequestPayload,
  z.infer<typeof zToDiskGetFileRequestPayload>
>({ value: true });
