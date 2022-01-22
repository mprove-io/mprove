import { common } from '~front/barrels/common';

export function getExtendedFilters(item: {
  fields: common.ModelField[];
  mconfig: common.Mconfig;
}) {
  let { fields, mconfig } = item;

  let extendedFilters: common.FilterX[] = [];

  if (fields && mconfig.filters) {
    extendedFilters = mconfig.filters.map(filter =>
      Object.assign({}, filter, <common.FilterX>{
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
