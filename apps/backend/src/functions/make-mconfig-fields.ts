import { FieldClassEnum } from '#common/enums/field-class.enum';
import type { MconfigField } from '#common/zod/backend/mconfig-field';
import type { MconfigChart } from '#common/zod/blockml/mconfig-chart';
import type { ModelField } from '#common/zod/blockml/model-field';
import type { Sorting } from '#common/zod/blockml/sorting';

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

    if (field.fieldClass === FieldClassEnum.Dimension) {
      selectDimensions.push(f);
    } else if (field.fieldClass === FieldClassEnum.Measure) {
      selectMeasuresAndCalculations.push(f);
    } else if (field.fieldClass === FieldClassEnum.Calculation) {
      selectMeasuresAndCalculations.push(f);
    }
  });

  let selectFields: MconfigField[] = [
    ...selectDimensions,
    ...selectMeasuresAndCalculations
  ];

  return selectFields;
}
