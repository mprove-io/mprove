import { isUndefined } from '#common/functions/is-undefined';

export function makeBranchExtraId(item: {
  isRepoProd: boolean;
  branchId: string;
  userId: string;
  isRepoSession?: boolean;
}) {
  return isUndefined(item.isRepoProd) || isUndefined(item.branchId)
    ? undefined
    : item.isRepoSession === true
      ? `session-${item.branchId}`
      : item.isRepoProd === true
        ? `production-${item.branchId}`
        : `${item.userId}-${item.branchId}`;
}
