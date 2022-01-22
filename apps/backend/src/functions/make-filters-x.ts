import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';

export function makeFiltersX(dashboard: entities.DashboardEntity) {
  let filtersX: common.FilterX[] = dashboard.fields.map(field => {
    let fractions = [
      ...field.fractions.filter(
        fraction => fraction.operator === common.FractionOperatorEnum.Or
      ),
      ...field.fractions.filter(
        fraction => fraction.operator === common.FractionOperatorEnum.And
      )
    ];

    let filterX: common.FilterX = {
      field: field as any,
      fractions: fractions,
      fieldId: field.id
    };
    return filterX;
  });

  return filtersX;
}
