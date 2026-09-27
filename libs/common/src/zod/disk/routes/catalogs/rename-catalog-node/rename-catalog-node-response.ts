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
  type ToDiskRenameCatalogNodeError,
  zToDiskRenameCatalogNodeError
} from './rename-catalog-node-error';

export type ToDiskRenameCatalogNodeResponse = ToDiskResponseBase<
  'renameCatalogNode',
  ToDiskRenameCatalogNodeOutput,
  ToDiskRenameCatalogNodeError
>;

export type ToDiskRenameCatalogNodeOutput = {
  repo: Repo;
  files: DiskCatalogFile[];
  mproveDir: string;
};

export let zToDiskRenameCatalogNodeOutput = z
  .object({
    repo: zRepo,
    files: z.array(zDiskCatalogFile),
    mproveDir: z.string()
  })
  .meta({ id: 'ToDiskRenameCatalogNodeOutput' });

export let zToDiskRenameCatalogNodeResponse = makeToDiskResponseSchema({
  operation: 'renameCatalogNode',
  output: zToDiskRenameCatalogNodeOutput,
  error: zToDiskRenameCatalogNodeError
});

assertTypesEqual<
  ToDiskRenameCatalogNodeOutput,
  z.infer<typeof zToDiskRenameCatalogNodeOutput>
>({ value: true });

assertTypesEqual<
  ToDiskRenameCatalogNodeResponse,
  z.infer<typeof zToDiskRenameCatalogNodeResponse>
>({ value: true });
