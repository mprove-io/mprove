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
  type ToDiskRevertRepoToLastCommitError,
  zToDiskRevertRepoToLastCommitError
} from './revert-repo-to-last-commit-error';

export type ToDiskRevertRepoToLastCommitOutput = {
  repo: Repo;
  files: DiskCatalogFile[];
  mproveDir: string;
};

export type ToDiskRevertRepoToLastCommitResponse = ToDiskResponse<
  'ToDiskRevertRepoToLastCommit',
  ToDiskRevertRepoToLastCommitOutput,
  ToDiskRevertRepoToLastCommitError
>;

export let zToDiskRevertRepoToLastCommitResponse = makeToDiskResponseSchema({
  path: 'ToDiskRevertRepoToLastCommit',
  success: z
    .object({
      repo: zRepo,
      files: z.array(zDiskCatalogFile),
      mproveDir: z.string()
    })
    .meta({ id: 'ToDiskRevertRepoToLastCommitOutput' }),
  error: zToDiskRevertRepoToLastCommitError
});

assertTypesEqual<
  ToDiskRevertRepoToLastCommitResponse,
  z.infer<typeof zToDiskRevertRepoToLastCommitResponse>
>({ value: true });
