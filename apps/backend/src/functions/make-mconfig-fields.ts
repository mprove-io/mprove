import { FieldClassEnum } from '~common/enums/field-class.enum';
import { MconfigField } from '~common/interfaces/backend/mconfig-field';
import { MconfigChart } from '~common/interfaces/blockml/mconfig-chart';
import { ModelField } from '~common/interfaces/blockml/model-field';
import { Sorting } from '~common/interfaces/blockml/sorting';

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
