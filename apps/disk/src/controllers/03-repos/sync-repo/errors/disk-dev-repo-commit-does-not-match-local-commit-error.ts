import { ErrorFactory } from '@praha/error-factory';
import { ErEnum } from '#common/enums/er.enum';

export class DiskDevRepoCommitDoesNotMatchLocalCommitError extends ErrorFactory(
  {
    name: 'DiskDevRepoCommitDoesNotMatchLocalCommitError',
    message: ErEnum.DISK_DEV_REPO_COMMIT_DOES_NOT_MATCH_LOCAL_COMMIT,
    fields: ErrorFactory.fields<{
      displayData: {
        branch: string;
        devLastCommit?: string;
        localLastCommit: string;
      };
    }>()
  }
) {}
