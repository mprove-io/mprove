import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import {
  type BaseProject,
  zBaseProject
} from '#common/zod/backend/base-project';

export type ToDiskGetCatalogFilesRequest = {
  operation: 'getCatalogFiles';
  traceId: string;
  input: {
    baseProject: BaseProject;
    repoId: string;
    branch: string;
  };
};

export let zToDiskGetCatalogFilesRequest = z
  .strictObject({
    operation: z.literal('getCatalogFiles'),
    traceId: z.string(),
    input: z
      .object({
        baseProject: zBaseProject,
        repoId: z.string(),
        branch: z.string()
      })
      .meta({ id: 'ToDiskGetCatalogFilesRequestInput' })
  })
  .meta({ id: 'ToDiskGetCatalogFilesRequest' });

assertTypesEqual<
  ToDiskGetCatalogFilesRequest,
  z.infer<typeof zToDiskGetCatalogFilesRequest>
>({ value: true });
