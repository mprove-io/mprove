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
  type ToDiskRevertRepoToRemoteError,
  zToDiskRevertRepoToRemoteError
} from './revert-repo-to-remote-error';

export type ToDiskRevertRepoToRemoteOutput = {
  repo: Repo;
  files: DiskCatalogFile[];
  mproveDir: string;
};

export type ToDiskRevertRepoToRemoteResponse = ToDiskResponse<
  'ToDiskRevertRepoToRemote',
  ToDiskRevertRepoToRemoteOutput,
  ToDiskRevertRepoToRemoteError
>;

export let zToDiskRevertRepoToRemoteResponse = makeToDiskResponseSchema({
  path: 'ToDiskRevertRepoToRemote',
  success: z
    .object({
      repo: zRepo,
      files: z.array(zDiskCatalogFile),
      mproveDir: z.string()
    })
    .meta({ id: 'ToDiskRevertRepoToRemoteOutput' }),
  error: zToDiskRevertRepoToRemoteError
});

assertTypesEqual<
  ToDiskRevertRepoToRemoteResponse,
  z.infer<typeof zToDiskRevertRepoToRemoteResponse>
>({ value: true });
