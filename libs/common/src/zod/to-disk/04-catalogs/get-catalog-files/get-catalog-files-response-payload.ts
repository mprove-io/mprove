import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import {
  type DiskCatalogFile,
  zDiskCatalogFile
} from '#common/zod/disk/disk-catalog-file';
import { type Repo, zRepo } from '#common/zod/disk/repo';

export type ToDiskGetCatalogFilesResponsePayload = {
  repo: Repo;
  files: DiskCatalogFile[];
  mproveDir: string;
};

export let zToDiskGetCatalogFilesResponsePayload = z
  .object({
    repo: zRepo,
    files: z.array(zDiskCatalogFile),
    mproveDir: z.string()
  })
  .meta({ id: 'ToDiskGetCatalogFilesResponsePayload' });

assertTypesEqual<
  ToDiskGetCatalogFilesResponsePayload,
  z.infer<typeof zToDiskGetCatalogFilesResponsePayload>
>({ value: true });
