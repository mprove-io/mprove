import { RepoTypeEnum } from '#common/enums/repo-type.enum';
import { isUndefined } from '#common/functions/is-undefined';

export function makeBranchExtraId(item: {
  repoType: RepoTypeEnum;
  branchId: string;
  userId: string;
}) {
  return isUndefined(item.repoType) || isUndefined(item.branchId)
    ? undefined
    : item.repoType === RepoTypeEnum.Session
      ? `session-${item.branchId}`
      : item.repoType === RepoTypeEnum.Prod
        ? `production-${item.branchId}`
        : `${item.userId}-${item.branchId}`;
}
