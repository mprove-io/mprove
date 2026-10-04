import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { RepoType } from '#common/types/disk/parts/repo/repo-type';

export function makeBranchExtraId(item: {
  repoType: RepoType;
  branchId: string;
  userId: string;
}) {
  return isUndefined(item.repoType) || isUndefined(item.branchId)
    ? undefined
    : item.repoType === 'session'
      ? `session-${item.branchId}`
      : item.repoType === 'production'
        ? `production-${item.branchId}`
        : `${item.userId}-${item.branchId}`;
}
