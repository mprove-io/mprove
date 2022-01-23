import { common } from '~backend/barrels/common';

export function makeMconfigFields(item: {
  modelFields: common.ModelField[];
  select: string[];
  sortings: common.Sorting[];
  chart: common.Chart;
}) {
  let { modelFields, select, sortings, chart } = item;

  let selectDimensions: common.MconfigField[] = [];
  let selectMeasures: common.MconfigField[] = [];
  let selectCalculations: common.MconfigField[] = [];

  select.forEach((fieldId: string) => {
    let field = modelFields.find(f => f.id === fieldId);
    let f: common.MconfigField = Object.assign({}, field, <common.MconfigField>{
      sorting: sortings.find(x => x.fieldId === fieldId),
      sortingNumber: sortings.findIndex(s => s.fieldId === fieldId),
      isHideColumn: chart?.hideColumns.indexOf(field.id) > -1
    });

    if (field.fieldClass === common.FieldClassEnum.Dimension) {
      selectDimensions.push(f);
    } else if (field.fieldClass === common.FieldClassEnum.Measure) {
      selectMeasures.push(f);
    } else if (field.fieldClass === common.FieldClassEnum.Calculation) {
      selectCalculations.push(f);
    }
  });

  let selectFields: common.MconfigField[] = [
    ...selectDimensions,
    ...selectMeasures,
    ...selectCalculations
  ];

  return selectFields;
}
