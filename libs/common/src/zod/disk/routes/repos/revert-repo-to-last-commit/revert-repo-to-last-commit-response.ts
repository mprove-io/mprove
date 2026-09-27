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
  type ToDiskRevertRepoToLastCommitError,
  zToDiskRevertRepoToLastCommitError
} from './revert-repo-to-last-commit-error';

export type ToDiskRevertRepoToLastCommitResponse = ToDiskResponseBase<
  'revertRepoToLastCommit',
  ToDiskRevertRepoToLastCommitOutput,
  ToDiskRevertRepoToLastCommitError
>;

export type ToDiskRevertRepoToLastCommitOutput = {
  repo: Repo;
  files: DiskCatalogFile[];
  mproveDir: string;
};

export let zToDiskRevertRepoToLastCommitOutput = z
  .object({
    repo: zRepo,
    files: z.array(zDiskCatalogFile),
    mproveDir: z.string()
  })
  .meta({ id: 'ToDiskRevertRepoToLastCommitOutput' });

export let zToDiskRevertRepoToLastCommitResponse = makeToDiskResponseSchema({
  operation: 'revertRepoToLastCommit',
  output: zToDiskRevertRepoToLastCommitOutput,
  error: zToDiskRevertRepoToLastCommitError
});

assertTypesEqual<
  ToDiskRevertRepoToLastCommitOutput,
  z.infer<typeof zToDiskRevertRepoToLastCommitOutput>
>({ value: true });

assertTypesEqual<
  ToDiskRevertRepoToLastCommitResponse,
  z.infer<typeof zToDiskRevertRepoToLastCommitResponse>
>({ value: true });
