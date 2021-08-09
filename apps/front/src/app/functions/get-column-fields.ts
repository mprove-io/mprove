import { ModelField } from '~common/_index';
import { common } from '~front/barrels/common';
import { ColumnField } from '../queries/mq.query';

export function getColumnFields(item: {
  mconfig: common.Mconfig;
  fields: ModelField[];
}) {
  let { select, sortings, chart } = item.mconfig;
  let fields = item.fields;

  let selectDimensions: ColumnField[] = [];
  let selectMeasures: ColumnField[] = [];
  let selectCalculations: ColumnField[] = [];

  select.forEach((fieldId: string) => {
    let field = fields.find(f => f.id === fieldId);
    let f: ColumnField = Object.assign({}, field, <ColumnField>{
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

  let selectFields: ColumnField[] = [
    ...selectDimensions,
    ...selectMeasures,
    ...selectCalculations
  ];

  return selectFields;
}
