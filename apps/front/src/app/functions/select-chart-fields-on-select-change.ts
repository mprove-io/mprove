import { common } from '~front/barrels/common';

export function selectChartFieldsOnSelectChange(item: {
  newMconfig: common.Mconfig;
  fields: common.ModelField[];
}) {
  let { newMconfig, fields } = item;

  if (newMconfig.select.length > 0) {
    let selectDimensions: string[] = [];
    let selectMeasures: string[] = [];
    let selectCalculations: string[] = [];

    newMconfig.select.forEach((fieldId: string) => {
      let field = fields.find(f => f.id === fieldId);

      if (field.fieldClass === common.FieldClassEnum.Dimension) {
        selectDimensions.push(field.id);
      } else if (field.fieldClass === common.FieldClassEnum.Measure) {
        selectMeasures.push(field.id);
      } else if (field.fieldClass === common.FieldClassEnum.Calculation) {
        selectCalculations.push(field.id);
      }
    });

    let selectMeasuresAndCalculations = [
      ...selectMeasures,
      ...selectCalculations
    ];

    // let sortedSelect: string[] = [
    //   ...selectDimensions,
    //   ...selectMeasuresAndCalculations
    // ];

    newMconfig.chart = Object.assign({}, newMconfig.chart, <common.Chart>{
      xField: selectDimensions.length > 0 ? selectDimensions[0] : undefined,
      yField:
        selectMeasuresAndCalculations.length > 0
          ? newMconfig.chart.yField || selectMeasuresAndCalculations[0]
          : undefined,
      yFields: selectMeasuresAndCalculations,
      multiField:
        selectDimensions.length === 2 ? selectDimensions[1] : undefined,
      valueField:
        selectMeasuresAndCalculations.length > 0
          ? newMconfig.chart.valueField || selectMeasuresAndCalculations[0]
          : undefined,
      previousValueField: newMconfig.chart.previousValueField
    });
  }

  return newMconfig;
}
