import {
  Mconfig,
  MconfigChart,
  ModelField,
  isDefined,
  setChartSeries
} from '~common/_index';
import { enums } from '~common/barrels/enums';

export function setChartFields<T extends Mconfig>(item: {
  oldChartType?: enums.ChartTypeEnum;
  newChartType?: enums.ChartTypeEnum;
  mconfig: T;
  fields: ModelField[];
}) {
  let { oldChartType, newChartType, mconfig, fields } = item;

  if (
    oldChartType === enums.ChartTypeEnum.Scatter &&
    newChartType !== enums.ChartTypeEnum.Scatter
  ) {
    mconfig.chart.xField = undefined;
    mconfig.chart.yFields = [];
  }

  if (mconfig.select.length > 0) {
    let selectedDimensionsResultIsNumberOrTs: string[] = [];
    let selectedDimensionsResultIsNotNumberOrTs: string[] = [];

    let selectedMCsResultIsNumber: string[] = [];
    let selectedMCsResultIsNotNumber: string[] = [];

    mconfig.select.forEach((fieldId: string) => {
      let field = fields.find(f => f.id === fieldId);

      if (field.fieldClass === enums.FieldClassEnum.Dimension) {
        if (
          field.result === enums.FieldResultEnum.Number ||
          field.result === enums.FieldResultEnum.Ts
        ) {
          selectedDimensionsResultIsNumberOrTs.push(field.id);
        } else {
          selectedDimensionsResultIsNotNumberOrTs.push(field.id);
        }
      } else if (
        field.fieldClass === enums.FieldClassEnum.Measure ||
        field.fieldClass === enums.FieldClassEnum.Calculation
      ) {
        if (field.result === enums.FieldResultEnum.Number) {
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
      isDefined(mconfig.chart.xField) &&
      mconfig.select.indexOf(mconfig.chart.xField) > -1
        ? mconfig.chart.xField
        : selectedDimensionsResultIsNumberOrTs.length > 0
          ? selectedDimensionsResultIsNumberOrTs[0]
          : selectedDimensionsResultIsNotNumberOrTs.length > 0
            ? selectedDimensionsResultIsNotNumberOrTs[0]
            : undefined;

    let sizeField =
      isDefined(mconfig.chart.sizeField) &&
      mconfig.select.indexOf(mconfig.chart.sizeField) > -1
        ? mconfig.chart.sizeField
        : undefined;

    let yFields =
      mconfig.chart.yFields?.length > 0 &&
      mconfig.chart.yFields.every(x => mconfig.select.includes(x))
        ? mconfig.chart.yFields
        : selectedMCsResultIsNumber;

    if (
      yFields.length > 0 &&
      (newChartType === enums.ChartTypeEnum.Pie ||
        newChartType === enums.ChartTypeEnum.Single)
    ) {
      yFields = [yFields[0]];
    }

    let multiField =
      isDefined(mconfig.chart.multiField) &&
      mconfig.select.indexOf(mconfig.chart.multiField) > -1 &&
      mconfig.chart.multiField !== xField
        ? mconfig.chart.multiField
        : selectedDimensions.length === 2
          ? selectedDimensions.filter(x => x !== xField)[0]
          : undefined;

    mconfig.chart = Object.assign({}, mconfig.chart, <MconfigChart>{
      xField: xField,
      yFields: yFields,
      multiField: multiField,
      sizeField: sizeField
    });

    mconfig = setChartSeries({ mconfig: mconfig });
  }

  return mconfig;
}
