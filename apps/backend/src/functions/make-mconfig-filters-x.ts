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
        fractions: x.fractions.sort((a, b) => {
          let getPriority = (op: common.FractionOperatorEnum): number => {
            if (op === common.FractionOperatorEnum.Or) return 0;
            if (op === common.FractionOperatorEnum.And) return 1;
            return 2;
          };

          return getPriority(a.operator) - getPriority(b.operator);
        }),
        field: modelFields.find(field => field.id === x.fieldId)
      };
      return filterX;
    });
  }

  return filtersX.sort((a, b) =>
    a.fieldId > b.fieldId ? 1 : b.fieldId > a.fieldId ? -1 : 0
  );
}
