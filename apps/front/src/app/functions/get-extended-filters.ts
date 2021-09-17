import { common } from '~front/barrels/common';
import { interfaces } from '~front/barrels/interfaces';

export function getExtendedFilters(item: {
  fields: common.ModelField[];
  mconfig: common.Mconfig;
}) {
  let { fields, mconfig } = item;

  let extendedFilters: interfaces.FilterExtended[] = [];

  if (fields && mconfig.filters) {
    extendedFilters = mconfig.filters.map(filter =>
      Object.assign({}, filter, <interfaces.FilterExtended>{
        field: fields.find(x => x.id === filter.fieldId),
        fractions: [
          ...filter.fractions.filter(
            fraction => fraction.operator === common.FractionOperatorEnum.Or
          ),
          ...filter.fractions.filter(
            fraction => fraction.operator === common.FractionOperatorEnum.And
          )
        ]
      })
    );
  }

  return extendedFilters;
}
