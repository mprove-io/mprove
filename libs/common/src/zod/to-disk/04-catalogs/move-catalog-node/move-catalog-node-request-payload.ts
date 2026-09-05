import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import {
  type BaseProject,
  zBaseProject
} from '#common/zod/backend/base-project';

export type ToDiskMoveCatalogNodeRequestPayload = {
  orgId: string;
  baseProject: BaseProject;
  repoId: string;
  branch: string;
  fromNodeId: string;
  toNodeId: string;
};

export let zToDiskMoveCatalogNodeRequestPayload = z
  .object({
    orgId: z.string(),
    baseProject: zBaseProject,
    repoId: z.string(),
    branch: z.string(),
    fromNodeId: z.string(),
    toNodeId: z.string()
  })
  .meta({ id: 'ToDiskMoveCatalogNodeRequestPayload' });

assertTypesEqual<
  ToDiskMoveCatalogNodeRequestPayload,
  z.infer<typeof zToDiskMoveCatalogNodeRequestPayload>
>({ value: true });
