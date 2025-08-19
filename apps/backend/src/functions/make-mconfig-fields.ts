export function makeMconfigFields(item: {
  modelFields: ModelField[];
  select: string[];
  sortings: Sorting[];
  chart: MconfigChart;
}) {
  let { modelFields, select, sortings, chart } = item;

  let selectDimensions: MconfigField[] = [];
  let selectMeasuresAndCalculations: MconfigField[] = []; // for columns moveLeft moveRight
  // let selectMeasures: MconfigField[] = [];
  // let selectCalculations: MconfigField[] = [];

  // console.log('select');
  // console.log(select);

  // console.log('modelFields.map(x=>x.id)');
  // console.log(modelFields.map(x=>x.id));

  select.forEach((fieldId: string) => {
    let field = modelFields.find(f => f.id === fieldId);
    let f: MconfigField = Object.assign({}, field, <MconfigField>{
      sorting: sortings.find(x => x.fieldId === fieldId),
      sortingNumber: sortings.findIndex(s => s.fieldId === fieldId),
      isHideColumn: chart?.hideColumns.indexOf(field.id) > -1
    });

    if (field.fieldClass === FieldClassEnum.Dimension) {
      selectDimensions.push(f);
    } else if (field.fieldClass === FieldClassEnum.Measure) {
      selectMeasuresAndCalculations.push(f);
      // selectMeasures.push(f);
    } else if (field.fieldClass === FieldClassEnum.Calculation) {
      selectMeasuresAndCalculations.push(f);
      // selectCalculations.push(f);
    }
  });

  let selectFields: MconfigField[] = [
    ...selectDimensions,
    ...selectMeasuresAndCalculations
    // ...selectMeasures,
    // ...selectCalculations
  ];

  return selectFields;
}
