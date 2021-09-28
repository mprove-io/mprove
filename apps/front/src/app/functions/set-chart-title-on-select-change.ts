import { common } from '~front/barrels/common';

export function setChartTitleOnSelectChange(item: {
  newMconfig: common.Mconfig;
  fields: common.ModelField[];
}) {
  let { newMconfig, fields } = item;

  if (newMconfig.select.length > 0) {
    let fieldsSelectedDimensions: common.ModelField[] = [];
    let fieldsSelectedMeasuresAndCalculations: common.ModelField[] = [];

    newMconfig.select.forEach((fieldId: string) => {
      let field = fields.find(f => f.id === fieldId);

      if (field.fieldClass === common.FieldClassEnum.Dimension) {
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

    newMconfig.chart.title = newTitle;
  }

  return newMconfig;
}

function getCompLabel(x: common.ModelField) {
  let topLabelPrefix =
    x.topLabel === common.ModelNodeLabelEnum.ModelFields
      ? ''
      : `${x.topLabel} `;

  let groupLabel = common.isDefined(x.groupLabel) ? `${x.groupLabel} ` : '';

  let compLabel = `${topLabelPrefix}${groupLabel}${x.label}`;

  return compLabel;
}
