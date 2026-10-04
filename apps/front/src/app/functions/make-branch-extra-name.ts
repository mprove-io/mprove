import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { RepoType } from '#common/types/disk/parts/repo/repo-type';

export function makeBranchExtraName(item: {
  repoType: RepoType;
  branchId: string;
  alias: string;
}) {
  return isUndefined(item.repoType) || isUndefined(item.branchId)
    ? undefined
    : item.repoType === 'session'
      ? `session - ${item.branchId}`
      : item.repoType === 'production'
        ? `production - ${item.branchId}`
        : `dev-${item.alias} - ${item.branchId}`;
}
