import { common } from '~front/barrels/common';

export function makeBranchExtraId(item: {
  isRepoProd: boolean;
  branchId: string;
  alias: string;
}) {
  return common.isUndefined(item.isRepoProd) ||
    common.isUndefined(item.branchId)
    ? undefined
    : item.isRepoProd === true
    ? `production-${item.branchId}`
    : `${item.alias}-${item.branchId}`;
}
