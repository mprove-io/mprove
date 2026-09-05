import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import {
  type BaseProject,
  zBaseProject
} from '#common/zod/backend/base-project';

export type ToDiskGetCatalogFilesRequestPayload = {
  orgId: string;
  baseProject: BaseProject;
  repoId: string;
  branch: string;
};

export let zToDiskGetCatalogFilesRequestPayload = z
  .object({
    orgId: z.string(),
    baseProject: zBaseProject,
    repoId: z.string(),
    branch: z.string()
  })
  .meta({ id: 'ToDiskGetCatalogFilesRequestPayload' });

assertTypesEqual<
  ToDiskGetCatalogFilesRequestPayload,
  z.infer<typeof zToDiskGetCatalogFilesRequestPayload>
>({ value: true });
