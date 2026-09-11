import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';

export type DiskRepoStatusIsNotNeedPushError = {
  code: 'DISK_REPO_STATUS_IS_NOT_NEED_PUSH';
};

export let zDiskRepoStatusIsNotNeedPushError = z.object({
  code: z.literal('DISK_REPO_STATUS_IS_NOT_NEED_PUSH')
});

assertTypesEqual<
  DiskRepoStatusIsNotNeedPushError,
  z.infer<typeof zDiskRepoStatusIsNotNeedPushError>
>({ value: true });
