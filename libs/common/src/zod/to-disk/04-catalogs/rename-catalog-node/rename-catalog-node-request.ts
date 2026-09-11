import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import {
  type BaseProject,
  zBaseProject
} from '#common/zod/backend/base-project';

export type ToDiskRenameCatalogNodeRequest = {
  operation: 'renameCatalogNode';
  traceId: string;
  input: {
    baseProject: BaseProject;
    repoId: string;
    branch: string;
    nodeId: string;
    newName: string;
  };
};

export let zToDiskRenameCatalogNodeRequest = z
  .strictObject({
    operation: z.literal('renameCatalogNode'),
    traceId: z.string(),
    input: z
      .object({
        baseProject: zBaseProject,
        repoId: z.string(),
        branch: z.string(),
        nodeId: z.string(),
        newName: z.string()
      })
      .meta({ id: 'ToDiskRenameCatalogNodeRequestInput' })
  })
  .meta({ id: 'ToDiskRenameCatalogNodeRequest' });

assertTypesEqual<
  ToDiskRenameCatalogNodeRequest,
  z.infer<typeof zToDiskRenameCatalogNodeRequest>
>({ value: true });
