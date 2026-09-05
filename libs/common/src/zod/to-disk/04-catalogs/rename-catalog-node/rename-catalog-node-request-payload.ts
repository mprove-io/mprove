import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import {
  type BaseProject,
  zBaseProject
} from '#common/zod/backend/base-project';

export type ToDiskRenameCatalogNodeRequestPayload = {
  orgId: string;
  baseProject: BaseProject;
  repoId: string;
  branch: string;
  nodeId: string;
  newName: string;
};

export let zToDiskRenameCatalogNodeRequestPayload = z
  .object({
    orgId: z.string(),
    baseProject: zBaseProject,
    repoId: z.string(),
    branch: z.string(),
    nodeId: z.string(),
    newName: z.string()
  })
  .meta({ id: 'ToDiskRenameCatalogNodeRequestPayload' });

assertTypesEqual<
  ToDiskRenameCatalogNodeRequestPayload,
  z.infer<typeof zToDiskRenameCatalogNodeRequestPayload>
>({ value: true });
