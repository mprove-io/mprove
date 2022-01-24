import { common } from '~backend/barrels/common';

export function makeMconfigFiltersX(item: {
  modelFields: common.ModelField[];
  mconfigFilters: common.Filter[];
}) {
  let { modelFields, mconfigFilters } = item;

  let filtersX: common.FilterX[] = [];

  if (common.isDefined(modelFields) && common.isDefined(mconfigFilters)) {
    filtersX = mconfigFilters.map(x => {
      let filterX: common.FilterX = {
        fieldId: x.fieldId,
        fractions: [
          ...x.fractions.filter(
            fraction => fraction.operator === common.FractionOperatorEnum.Or
          ),
          ...x.fractions.filter(
            fraction => fraction.operator === common.FractionOperatorEnum.And
          )
        ],
        field: modelFields.find(field => field.id === x.fieldId)
      };
      return filterX;
    });
  }

  return filtersX;
}
