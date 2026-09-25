import { FieldClassEnum } from '#common/enums/field-class.enum';
import { getCompLabel } from '#common/functions/set-chart-title-on-select-change/get-comp-label/get-comp-label';
import type { Mconfig } from '#common/zod/blockml/mconfig';
import type { ModelField } from '#common/zod/blockml/model-field';

export function setChartTitleOnSelectChange<T extends Mconfig>(item: {
  mconfig: T;
  fields: ModelField[];
}) {
  let { mconfig, fields } = item;

  if (mconfig.select.length > 0) {
    let fieldsSelectedDimensions: ModelField[] = [];
    let fieldsSelectedMeasuresAndCalculations: ModelField[] = [];

    mconfig.select.forEach((fieldId: string) => {
      let field = fields.find(f => f.id === fieldId);

      if (field.fieldClass === FieldClassEnum.Dimension) {
        fieldsSelectedDimensions.push(field);
      } else {
        fieldsSelectedMeasuresAndCalculations.push(field);
      }
    });

    let newTitle = '';

    fieldsSelectedMeasuresAndCalculations.forEach(x => {
      let compLabel: string = getCompLabel({ field: x });

      newTitle = newTitle === '' ? `${compLabel}` : `${newTitle}, ${compLabel}`;
    });

    if (newTitle === '') {
      fieldsSelectedDimensions.forEach(x => {
        let compLabel: string = getCompLabel({ field: x });

        newTitle =
          newTitle === '' ? `${compLabel}` : `${newTitle}, ${compLabel}`;
      });
    } else {
      fieldsSelectedDimensions.forEach(x => {
        let compLabel: string = getCompLabel({ field: x });

        newTitle = `${newTitle} by ${compLabel}`;
      });
    }

    mconfig.chart.title = newTitle;
  }

  return mconfig;
}
