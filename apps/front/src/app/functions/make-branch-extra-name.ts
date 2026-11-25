import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { RepoType } from '#common/types/disk/parts/repo/repo-type';

export function makeBranchExtraName(item: {
  repoType: RepoType;
  branchId: string;
  alias: string;
}): string {
  let { repoType, branchId, alias } = item;

  let extraName: string =
    isUndefined(repoType) || isUndefined(branchId)
      ? undefined
      : repoType === 'session'
        ? `session - ${branchId}`
        : repoType === 'production'
          ? `${branchId} - production`
          : `${branchId} - dev-${alias}`;

  return extraName;
}
