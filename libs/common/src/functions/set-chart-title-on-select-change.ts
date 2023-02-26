import { enums } from '~common/barrels/enums';
import { isDefined, Mconfig, ModelField } from '~common/_index';

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

      if (field.fieldClass === enums.FieldClassEnum.Dimension) {
        fieldsSelectedDimensions.push(field);
      } else {
        fieldsSelectedMeasuresAndCalculations.push(field);
      }
    });

    let newTitle = '';

    fieldsSelectedMeasuresAndCalculations.forEach(x => {
      let compLabel = getCompLabel(x);
      newTitle = newTitle === '' ? `${compLabel}` : `${newTitle}, ${compLabel}`;
    });

    if (newTitle === '') {
      fieldsSelectedDimensions.forEach(x => {
        let compLabel = getCompLabel(x);
        newTitle =
          newTitle === '' ? `${compLabel}` : `${newTitle}, ${compLabel}`;
      });
    } else {
      fieldsSelectedDimensions.forEach(x => {
        let compLabel = getCompLabel(x);
        newTitle = `${newTitle} by ${compLabel}`;
      });
    }

    mconfig.chart.title = newTitle;
  }

  return mconfig;
}

function getCompLabel(x: ModelField) {
  let topLabelPrefix =
    x.topLabel === enums.ModelNodeLabelEnum.ModelFields ? '' : `${x.topLabel} `;

  let groupLabel = isDefined(x.groupLabel) ? `${x.groupLabel} ` : '';

  let compLabel = `${topLabelPrefix}${groupLabel}${x.label}`;

  return compLabel;
}
