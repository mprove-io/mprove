import { ErrorFactory } from '@praha/error-factory';
import { ErEnum } from '#common/enums/er.enum';

export class DiskRepoIsNotCleanForCheckoutBranchError extends ErrorFactory({
  name: 'DiskRepoIsNotCleanForCheckoutBranchError',
  message: ErEnum.DISK_REPO_IS_NOT_CLEAN_FOR_CHECKOUT_BRANCH,
  fields: ErrorFactory.fields<{
    displayData: {
      currentBranch: string;
    };
  }>()
}) {}
