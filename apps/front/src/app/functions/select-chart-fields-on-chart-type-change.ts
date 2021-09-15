import { common } from '~front/barrels/common';

export function selectChartFieldsOnChartTypeChange(item: {
  newMconfig: common.Mconfig;
  fields: common.ModelField[];
}) {
  let { newMconfig, fields } = item;

  if (newMconfig.select.length > 0) {
    let selectDimensionsResultIsNumberOrTs: string[] = [];
    let selectDimensionsResultIsNotNumberOrTs: string[] = [];
    let selectMeasures: string[] = [];
    let selectCalculations: string[] = [];

    newMconfig.select.forEach((fieldId: string) => {
      let field = fields.find(f => f.id === fieldId);

      if (field.fieldClass === common.FieldClassEnum.Dimension) {
        if (
          field.result === common.FieldResultEnum.Number ||
          field.result === common.FieldResultEnum.Ts
        ) {
          selectDimensionsResultIsNumberOrTs.push(field.id);
        } else {
          selectDimensionsResultIsNotNumberOrTs.push(field.id);
        }
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

    let selectDimensions = [
      ...selectDimensionsResultIsNumberOrTs,
      selectDimensionsResultIsNotNumberOrTs
    ];

    let xField = common.isDefined(newMconfig.chart.xField)
      ? newMconfig.chart.xField
      : selectDimensionsResultIsNumberOrTs.length > 0
      ? selectDimensionsResultIsNumberOrTs[0]
      : selectDimensionsResultIsNotNumberOrTs.length > 0
      ? selectDimensionsResultIsNotNumberOrTs[0]
      : undefined;

    newMconfig.chart = Object.assign({}, newMconfig.chart, <common.Chart>{
      xField: xField,
      yField:
        newMconfig.chart.yField || selectMeasuresAndCalculations.length > 0
          ? newMconfig.chart.yField || selectMeasuresAndCalculations[0]
          : undefined,
      yFields: newMconfig.chart.yFields || selectMeasuresAndCalculations,
      multiField: common.isDefined(newMconfig.chart.multiField)
        ? newMconfig.chart.multiField
        : selectDimensions.length === 2
        ? selectDimensions.filter(x => x !== xField)[0]
        : undefined,
      valueField:
        newMconfig.chart.valueField || selectMeasuresAndCalculations.length > 0
          ? newMconfig.chart.valueField || selectMeasuresAndCalculations[0]
          : undefined,
      previousValueField: newMconfig.chart.previousValueField
    });
  }

  return newMconfig;
}
