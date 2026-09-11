import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';

export type DiskDevRepoCommitDoesNotMatchLocalCommitError = {
  code: 'DISK_DEV_REPO_COMMIT_DOES_NOT_MATCH_LOCAL_COMMIT';
  displayData: {
    branch: string;
    devLastCommit?: string;
    localLastCommit: string;
  };
};

export let zDiskDevRepoCommitDoesNotMatchLocalCommitError = z.object({
  code: z.literal('DISK_DEV_REPO_COMMIT_DOES_NOT_MATCH_LOCAL_COMMIT'),
  displayData: z.object({
    branch: z.string(),
    devLastCommit: z.string().nullish(),
    localLastCommit: z.string()
  })
});

assertTypesEqual<
  DiskDevRepoCommitDoesNotMatchLocalCommitError,
  z.infer<typeof zDiskDevRepoCommitDoesNotMatchLocalCommitError>
>({ value: true });
