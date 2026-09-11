import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';

export type DiskRepoIsNotCleanForCheckoutBranchError = {
  code: 'DISK_REPO_IS_NOT_CLEAN_FOR_CHECKOUT_BRANCH';
  displayData: { currentBranch: string };
};

export let zDiskRepoIsNotCleanForCheckoutBranchError = z.object({
  code: z.literal('DISK_REPO_IS_NOT_CLEAN_FOR_CHECKOUT_BRANCH'),
  displayData: z.object({ currentBranch: z.string() })
});

assertTypesEqual<
  DiskRepoIsNotCleanForCheckoutBranchError,
  z.infer<typeof zDiskRepoIsNotCleanForCheckoutBranchError>
>({
  value: true
});
