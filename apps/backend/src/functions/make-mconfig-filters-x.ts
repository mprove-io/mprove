export function makeMconfigFiltersX(item: {
  modelFields: ModelField[];
  mconfigFilters: Filter[];
}) {
  let { modelFields, mconfigFilters } = item;

  let filtersX: FilterX[] = [];

  if (isDefined(modelFields) && isDefined(mconfigFilters)) {
    filtersX = mconfigFilters.map(x => {
      let filterX: FilterX = {
        fieldId: x.fieldId,
        fractions: x.fractions.sort((a, b) => {
          let getPriority = (op: FractionOperatorEnum): number => {
            if (op === FractionOperatorEnum.Or) return 0;
            if (op === FractionOperatorEnum.And) return 1;
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
