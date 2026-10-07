import type { MconfigField } from '#common/types/backend/parts/mconfig/mconfig-field';
import type { MconfigChart } from '#common/types/blockml/parts/mconfig/mconfig-chart';
import type { ModelField } from '#common/types/blockml/parts/model/model-field';
import type { Sorting } from '#common/types/blockml/parts/query/sorting';

export function makeMconfigFields(item: {
  modelFields: ModelField[];
  select: string[];
  sortings: Sorting[];
  chart: MconfigChart;
}) {
  let { modelFields, select, sortings, chart } = item;

  let selectDimensions: MconfigField[] = [];
  let selectMeasuresAndCalculations: MconfigField[] = []; // for columns moveLeft moveRight

  select.forEach((fieldId: string) => {
    let field = modelFields.find(f => f.id === fieldId);
    let f: MconfigField = Object.assign({}, field, <MconfigField>{
      sorting: sortings.find(x => x.fieldId === fieldId),
      sortingNumber: sortings.findIndex(s => s.fieldId === fieldId)
    });

    if (field.fieldClass === 'dimension') {
      selectDimensions.push(f);
    } else if (field.fieldClass === 'measure') {
      selectMeasuresAndCalculations.push(f);
    } else if (field.fieldClass === 'calculation') {
      selectMeasuresAndCalculations.push(f);
    }
  });

  let selectFields: MconfigField[] = [
    ...selectDimensions,
    ...selectMeasuresAndCalculations
  ];

  return selectFields;
}
