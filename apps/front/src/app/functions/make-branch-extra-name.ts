import { RepoTypeEnum } from '#common/enums/repo-type.enum';
import { isUndefined } from '#common/functions/is-undefined';

export function makeBranchExtraName(item: {
  repoType: RepoTypeEnum;
  branchId: string;
  alias: string;
}) {
  return isUndefined(item.repoType) || isUndefined(item.branchId)
    ? undefined
    : item.repoType === RepoTypeEnum.Session
      ? `session - ${item.branchId}`
      : item.repoType === RepoTypeEnum.Prod
        ? `production - ${item.branchId}`
        : `dev-${item.alias} - ${item.branchId}`;
}
