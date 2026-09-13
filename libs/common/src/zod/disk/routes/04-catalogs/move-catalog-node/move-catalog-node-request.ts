import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import {
  type BaseProject,
  zBaseProject
} from '#common/zod/backend/base-project';

export type ToDiskMoveCatalogNodeRequest = {
  operation: 'moveCatalogNode';
  traceId: string;
  input: {
    baseProject: BaseProject;
    repoId: string;
    branch: string;
    fromNodeId: string;
    toNodeId: string;
  };
};

export let zToDiskMoveCatalogNodeRequest = z
  .strictObject({
    operation: z.literal('moveCatalogNode'),
    traceId: z.string(),
    input: z
      .object({
        baseProject: zBaseProject,
        repoId: z.string(),
        branch: z.string(),
        fromNodeId: z.string(),
        toNodeId: z.string()
      })
      .meta({ id: 'ToDiskMoveCatalogNodeRequestInput' })
  })
  .meta({ id: 'ToDiskMoveCatalogNodeRequest' });

assertTypesEqual<
  ToDiskMoveCatalogNodeRequest,
  z.infer<typeof zToDiskMoveCatalogNodeRequest>
>({ value: true });
