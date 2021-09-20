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
      let topLabelPrefix = getTopLabelPrefix(x);

      newTitle =
        newTitle === ''
          ? `${topLabelPrefix}${x.label}`
          : `${newTitle}, ${topLabelPrefix}${x.label}`;
    });

    if (newTitle === '') {
      fieldsSelectedDimensions.forEach(x => {
        let topLabelPrefix = getTopLabelPrefix(x);

        newTitle =
          newTitle === ''
            ? `${topLabelPrefix}${x.label}`
            : `${newTitle}, ${topLabelPrefix}${x.label}`;
      });
    } else {
      fieldsSelectedDimensions.forEach(x => {
        let topLabelPrefix = getTopLabelPrefix(x);

        newTitle = `${newTitle} by ${topLabelPrefix}${x.label}`;
      });
    }

    newMconfig.chart.title = newTitle;
  }

  return newMconfig;
}

function getTopLabelPrefix(x: common.ModelField) {
  let topLabelPrefix =
    x.topLabel === common.ModelNodeLabelEnum.ModelFields
      ? ''
      : `${x.topLabel} `;

  return topLabelPrefix;
}
