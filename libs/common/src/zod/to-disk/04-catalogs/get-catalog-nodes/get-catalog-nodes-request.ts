import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import {
  type BaseProject,
  zBaseProject
} from '#common/zod/backend/base-project';

export type ToDiskGetCatalogNodesRequest = {
  operation: 'getCatalogNodes';
  traceId: string;
  input: {
    baseProject: BaseProject;
    repoId: string;
    branch?: string;
    isFetch: boolean;
  };
};

export let zToDiskGetCatalogNodesRequest = z
  .strictObject({
    operation: z.literal('getCatalogNodes'),
    traceId: z.string(),
    input: z
      .object({
        baseProject: zBaseProject,
        repoId: z.string(),
        branch: z.string().nullish(),
        isFetch: z.boolean()
      })
      .meta({ id: 'ToDiskGetCatalogNodesRequestInput' })
  })
  .meta({ id: 'ToDiskGetCatalogNodesRequest' });

assertTypesEqual<
  ToDiskGetCatalogNodesRequest,
  z.infer<typeof zToDiskGetCatalogNodesRequest>
>({ value: true });
