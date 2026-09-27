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
  type ToDiskRevertRepoToRemoteError,
  zToDiskRevertRepoToRemoteError
} from './revert-repo-to-remote-error';

export type ToDiskRevertRepoToRemoteResponse = ToDiskResponseBase<
  'revertRepoToRemote',
  ToDiskRevertRepoToRemoteOutput,
  ToDiskRevertRepoToRemoteError
>;

export type ToDiskRevertRepoToRemoteOutput = {
  repo: Repo;
  files: DiskCatalogFile[];
  mproveDir: string;
};

export let zToDiskRevertRepoToRemoteOutput = z
  .object({
    repo: zRepo,
    files: z.array(zDiskCatalogFile),
    mproveDir: z.string()
  })
  .meta({ id: 'ToDiskRevertRepoToRemoteOutput' });

export let zToDiskRevertRepoToRemoteResponse = makeToDiskResponseSchema({
  operation: 'revertRepoToRemote',
  output: zToDiskRevertRepoToRemoteOutput,
  error: zToDiskRevertRepoToRemoteError
});

assertTypesEqual<
  ToDiskRevertRepoToRemoteOutput,
  z.infer<typeof zToDiskRevertRepoToRemoteOutput>
>({ value: true });

assertTypesEqual<
  ToDiskRevertRepoToRemoteResponse,
  z.infer<typeof zToDiskRevertRepoToRemoteResponse>
>({ value: true });
