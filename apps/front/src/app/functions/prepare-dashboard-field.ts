import { common } from '~front/barrels/common';

export function prepareDashboardField(item: { field: common.DashboardField }) {
  let { field } = item;

  let preparedField = {
    filter: field.id,
    hidden: field.hidden,
    label: field.label,
    description: field.description,
    result: field.result,
    default:
      common.isDefined(field.fractions) && field.fractions.length > 0
        ? field.fractions.map(x => x.brick)
        : undefined
  };

  return preparedField;
}
