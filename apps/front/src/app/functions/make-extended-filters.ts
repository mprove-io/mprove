import { common } from '~front/barrels/common';
import { interfaces } from '~front/barrels/interfaces';

export function makeExtendedFilters(dashboard: common.Dashboard) {
  let extendedFilters: interfaces.FilterExtended[] = dashboard.fields.map(
    field => {
      let fractions = [
        ...field.fractions.filter(
          fraction => fraction.operator === common.FractionOperatorEnum.Or
        ),
        ...field.fractions.filter(
          fraction => fraction.operator === common.FractionOperatorEnum.And
        )
      ];

      let filterExtended: interfaces.FilterExtended = {
        field: field as any,
        fractions: fractions,
        fieldId: field.id
      };
      return filterExtended;
    }
  );

  return extendedFilters;
}
