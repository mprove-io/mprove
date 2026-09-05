import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import {
  type BaseProject,
  zBaseProject
} from '#common/zod/backend/base-project';

export type ToDiskGetCatalogNodesRequestPayload = {
  orgId: string;
  baseProject: BaseProject;
  repoId: string;
  branch?: string;
  isFetch: boolean;
};

export let zToDiskGetCatalogNodesRequestPayload = z
  .object({
    orgId: z.string(),
    baseProject: zBaseProject,
    repoId: z.string(),
    branch: z.string().nullish(),
    isFetch: z.boolean()
  })
  .meta({ id: 'ToDiskGetCatalogNodesRequestPayload' });

assertTypesEqual<
  ToDiskGetCatalogNodesRequestPayload,
  z.infer<typeof zToDiskGetCatalogNodesRequestPayload>
>({ value: true });
