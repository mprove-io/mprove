import { isUndefined } from '#common/functions/is-undefined';

export function makeBranchExtraName(item: {
  isRepoProd: boolean;
  branchId: string;
  alias: string;
  isRepoSession?: boolean;
}) {
  return isUndefined(item.isRepoProd) || isUndefined(item.branchId)
    ? undefined
    : item.isRepoSession === true
      ? `session - ${item.branchId}`
      : item.isRepoProd === true
        ? `production - ${item.branchId}`
        : `dev-${item.alias} - ${item.branchId}`;
}
