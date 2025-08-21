import { isUndefined } from '~common/functions/is-undefined';

export function makeBranchExtraId(item: {
  isRepoProd: boolean;
  branchId: string;
  userId: string;
}) {
  return isUndefined(item.isRepoProd) || isUndefined(item.branchId)
    ? undefined
    : item.isRepoProd === true
      ? `production-${item.branchId}`
      : `${item.userId}-${item.branchId}`;
}
