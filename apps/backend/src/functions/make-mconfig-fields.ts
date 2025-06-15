import { common } from '~backend/barrels/common';

export function makeMconfigFields(item: {
  modelFields: common.ModelField[];
  select: string[];
  sortings: common.Sorting[];
  chart: common.MconfigChart;
}) {
  let { modelFields, select, sortings, chart } = item;

  let selectDimensions: common.MconfigField[] = [];
  let selectMeasuresAndCalculations: common.MconfigField[] = []; // for columns moveLeft moveRight
  // let selectMeasures: common.MconfigField[] = [];
  // let selectCalculations: common.MconfigField[] = [];

  // console.log('select');
  // console.log(select);

  // console.log('modelFields.map(x=>x.id)');
  // console.log(modelFields.map(x=>x.id));

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
      selectMeasuresAndCalculations.push(f);
      // selectMeasures.push(f);
    } else if (field.fieldClass === common.FieldClassEnum.Calculation) {
      selectMeasuresAndCalculations.push(f);
      // selectCalculations.push(f);
    }
  });

  let selectFields: common.MconfigField[] = [
    ...selectDimensions,
    ...selectMeasuresAndCalculations
    // ...selectMeasures,
    // ...selectCalculations
  ];

  return selectFields;
}
