import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import {
  type DiskCatalogFile,
  zDiskCatalogFile
} from '#common/zod/disk/disk-catalog-file';
import { type Repo, zRepo } from '#common/zod/disk/repo';
import {
  makeToDiskResponseSchema,
  type ToDiskResponse
} from '#common/zod/to-disk/to-disk-response';
import {
  type ToDiskRenameCatalogNodeError,
  zToDiskRenameCatalogNodeError
} from './rename-catalog-node-error';

export type ToDiskRenameCatalogNodeOutput = {
  repo: Repo;
  files: DiskCatalogFile[];
  mproveDir: string;
};

export type ToDiskRenameCatalogNodeResponse = ToDiskResponse<
  'ToDiskRenameCatalogNode',
  ToDiskRenameCatalogNodeOutput,
  ToDiskRenameCatalogNodeError
>;

export let zToDiskRenameCatalogNodeResponse = makeToDiskResponseSchema({
  path: 'ToDiskRenameCatalogNode',
  success: z
    .object({
      repo: zRepo,
      files: z.array(zDiskCatalogFile),
      mproveDir: z.string()
    })
    .meta({ id: 'ToDiskRenameCatalogNodeOutput' }),
  error: zToDiskRenameCatalogNodeError
});

assertTypesEqual<
  ToDiskRenameCatalogNodeResponse,
  z.infer<typeof zToDiskRenameCatalogNodeResponse>
>({ value: true });
