import { ChartTypeEnum } from '~common/enums/chart/chart-type.enum';
import { FieldClassEnum } from '~common/enums/field-class.enum';
import { FieldResultEnum } from '~common/enums/field-result.enum';
import { Mconfig } from '~common/interfaces/blockml/mconfig';
import { MconfigChart } from '~common/interfaces/blockml/mconfig-chart';
import { ModelField } from '~common/interfaces/blockml/model-field';
import { isDefined } from './is-defined';
import { setChartSeries } from './set-chart-series';

export function setChartFields<T extends Mconfig>(item: {
  oldChartType?: ChartTypeEnum;
  newChartType?: ChartTypeEnum;
  mconfig: T;
  fields: ModelField[];
}) {
  let { oldChartType, newChartType, mconfig, fields } = item;

  if (
    oldChartType === ChartTypeEnum.Scatter &&
    newChartType !== ChartTypeEnum.Scatter
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

      if (field.fieldClass === FieldClassEnum.Dimension) {
        if (
          field.result === FieldResultEnum.Number ||
          field.result === FieldResultEnum.Ts
        ) {
          selectedDimensionsResultIsNumberOrTs.push(field.id);
        } else {
          selectedDimensionsResultIsNotNumberOrTs.push(field.id);
        }
      } else if (
        field.fieldClass === FieldClassEnum.Measure ||
        field.fieldClass === FieldClassEnum.Calculation
      ) {
        if (field.result === FieldResultEnum.Number) {
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
      (newChartType === ChartTypeEnum.Pie ||
        newChartType === ChartTypeEnum.Single)
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
