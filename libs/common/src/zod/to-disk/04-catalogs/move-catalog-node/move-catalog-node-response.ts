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
  type ToDiskMoveCatalogNodeError,
  zToDiskMoveCatalogNodeError
} from './move-catalog-node-error';

export type ToDiskMoveCatalogNodeOutput = {
  repo: Repo;
  files: DiskCatalogFile[];
  mproveDir: string;
};

export type ToDiskMoveCatalogNodeResponse = ToDiskResponse<
  'moveCatalogNode',
  ToDiskMoveCatalogNodeOutput,
  ToDiskMoveCatalogNodeError
>;

export let zToDiskMoveCatalogNodeResponse = makeToDiskResponseSchema({
  operation: 'moveCatalogNode',
  success: z
    .object({
      repo: zRepo,
      files: z.array(zDiskCatalogFile),
      mproveDir: z.string()
    })
    .meta({ id: 'ToDiskMoveCatalogNodeOutput' }),
  error: zToDiskMoveCatalogNodeError
});

assertTypesEqual<
  ToDiskMoveCatalogNodeResponse,
  z.infer<typeof zToDiskMoveCatalogNodeResponse>
>({ value: true });
