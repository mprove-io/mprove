import { isUndefined } from '#common/functions/is-undefined';

export function makeBranchExtraName(item: {
  isRepoProd: boolean;
  branchId: string;
  alias: string;
}) {
  return isUndefined(item.isRepoProd) || isUndefined(item.branchId)
    ? undefined
    : item.isRepoProd === true
      ? `production - ${item.branchId}`
      : `dev-${item.alias} - ${item.branchId}`;
}
