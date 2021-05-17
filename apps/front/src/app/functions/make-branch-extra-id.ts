import { common } from '~front/barrels/common';

export function makeBranchExtraId(item: {
  isRepoProd: boolean;
  branchId: string;
  userId: string;
}) {
  return common.isUndefined(item.isRepoProd) ||
    common.isUndefined(item.branchId)
    ? undefined
    : item.isRepoProd === true
    ? `production-${item.branchId}`
    : `${item.userId}-${item.branchId}`;
}
