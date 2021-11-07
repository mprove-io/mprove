import { common } from '~front/barrels/common';

export function setChartFields(item: {
  newMconfig: common.Mconfig;
  fields: common.ModelField[];
}) {
  let { newMconfig, fields } = item;

  if (newMconfig.select.length > 0) {
    let selectedDimensionsResultIsNumberOrTs: string[] = [];
    let selectedDimensionsResultIsNotNumberOrTs: string[] = [];

    let selectedMCsResultIsNumber: string[] = [];
    let selectedMCsResultIsNotNumber: string[] = [];

    newMconfig.select.forEach((fieldId: string) => {
      let field = fields.find(f => f.id === fieldId);

      if (field.fieldClass === common.FieldClassEnum.Dimension) {
        if (
          field.result === common.FieldResultEnum.Number ||
          field.result === common.FieldResultEnum.Ts
        ) {
          selectedDimensionsResultIsNumberOrTs.push(field.id);
        } else {
          selectedDimensionsResultIsNotNumberOrTs.push(field.id);
        }
      } else if (
        field.fieldClass === common.FieldClassEnum.Measure ||
        field.fieldClass === common.FieldClassEnum.Calculation
      ) {
        if (field.result === common.FieldResultEnum.Number) {
          selectedMCsResultIsNumber.push(field.id);
        } else {
          selectedMCsResultIsNotNumber.push(field.id);
        }
      }
    });

    let selectedDimensions = [
      ...selectedDimensionsResultIsNumberOrTs,
      ...selectedDimensionsResultIsNotNumberOrTs
    ];

    let selectedMCs = [
      ...selectedMCsResultIsNumber,
      ...selectedMCsResultIsNotNumber
    ];

    let xField =
      common.isDefined(newMconfig.chart.xField) &&
      newMconfig.select.indexOf(newMconfig.chart.xField) > -1
        ? newMconfig.chart.xField
        : selectedDimensionsResultIsNumberOrTs.length > 0
        ? selectedDimensionsResultIsNumberOrTs[0]
        : selectedDimensionsResultIsNotNumberOrTs.length > 0
        ? selectedDimensionsResultIsNotNumberOrTs[0]
        : undefined;

    let yField =
      common.isDefined(newMconfig.chart.yField) &&
      newMconfig.select.indexOf(newMconfig.chart.yField) > -1
        ? newMconfig.chart.yField
        : selectedMCsResultIsNumber.length > 0
        ? selectedMCsResultIsNumber[0]
        : selectedMCsResultIsNotNumber.length > 0
        ? selectedMCsResultIsNotNumber[0]
        : undefined;

    let yFields =
      newMconfig.chart.yFields?.length > 0 &&
      newMconfig.chart.yFields.every(x => newMconfig.select.includes(x))
        ? newMconfig.chart.yFields
        : selectedMCsResultIsNumber;

    let multiField =
      common.isDefined(newMconfig.chart.multiField) &&
      newMconfig.select.indexOf(newMconfig.chart.multiField) > -1 &&
      newMconfig.chart.multiField !== xField
        ? newMconfig.chart.multiField
        : selectedDimensions.length === 2
        ? selectedDimensions.filter(x => x !== xField)[0]
        : undefined;

    let valueField =
      common.isDefined(newMconfig.chart.valueField) &&
      newMconfig.select.indexOf(newMconfig.chart.valueField) > -1
        ? newMconfig.chart.valueField
        : selectedMCsResultIsNumber.length > 0
        ? selectedMCsResultIsNumber[0]
        : selectedMCsResultIsNotNumber.length > 0
        ? selectedMCsResultIsNotNumber[0]
        : undefined;

    let previousValueField =
      common.isDefined(newMconfig.chart.previousValueField) &&
      newMconfig.select.indexOf(newMconfig.chart.previousValueField) > -1
        ? newMconfig.chart.previousValueField
        : undefined;

    newMconfig.chart = Object.assign({}, newMconfig.chart, <common.Chart>{
      xField: xField,
      yField: yField,
      yFields: yFields,
      multiField: multiField,
      valueField: valueField,
      previousValueField: previousValueField
    });
  }

  return newMconfig;
}
