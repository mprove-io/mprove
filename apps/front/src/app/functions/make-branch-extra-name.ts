import { common } from '~front/barrels/common';

export function makeBranchExtraName(item: {
  isRepoProd: boolean;
  branchId: string;
  alias: string;
}) {
  return common.isUndefined(item.isRepoProd) ||
    common.isUndefined(item.branchId)
    ? undefined
    : item.isRepoProd === true
    ? `production - ${item.branchId}`
    : `dev-${item.alias} - ${item.branchId}`;
}
