import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type DiskCatalogFile,
  zDiskCatalogFile
} from '#common/zod/disk/disk-catalog-file';
import { type Repo, zRepo } from '#common/zod/disk/repo';
import {
  makeToDiskResponseSchema,
  type ToDiskResponseBase
} from '#common/zod/disk/response/to-disk-response-base';
import {
  type ToDiskMoveCatalogNodeError,
  zToDiskMoveCatalogNodeError
} from './move-catalog-node-error';

export type ToDiskMoveCatalogNodeResponse = ToDiskResponseBase<
  'moveCatalogNode',
  ToDiskMoveCatalogNodeOutput,
  ToDiskMoveCatalogNodeError
>;

export type ToDiskMoveCatalogNodeOutput = {
  repo: Repo;
  files: DiskCatalogFile[];
  mproveDir: string;
};

export let zToDiskMoveCatalogNodeOutput = z
  .object({
    repo: zRepo,
    files: z.array(zDiskCatalogFile),
    mproveDir: z.string()
  })
  .meta({ id: 'ToDiskMoveCatalogNodeOutput' });

export let zToDiskMoveCatalogNodeResponse = makeToDiskResponseSchema({
  operation: 'moveCatalogNode',
  output: zToDiskMoveCatalogNodeOutput,
  error: zToDiskMoveCatalogNodeError
});

assertTypesEqual<
  ToDiskMoveCatalogNodeOutput,
  z.infer<typeof zToDiskMoveCatalogNodeOutput>
>({ value: true });

assertTypesEqual<
  ToDiskMoveCatalogNodeResponse,
  z.infer<typeof zToDiskMoveCatalogNodeResponse>
>({ value: true });
