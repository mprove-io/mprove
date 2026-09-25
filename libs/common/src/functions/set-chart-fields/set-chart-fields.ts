import { ChartTypeEnum } from '#common/enums/chart/chart-type.enum';
import { FieldClassEnum } from '#common/enums/field-class.enum';
import { FieldResultEnum } from '#common/enums/field-result.enum';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { setChartSeries } from '#common/functions/set-chart-series/set-chart-series';
import type { Mconfig } from '#common/zod/blockml/mconfig';
import type { MconfigChart } from '#common/zod/blockml/mconfig-chart';
import type { ModelField } from '#common/zod/blockml/model-field';

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

    let pivotRows = (mconfig.chart.pivotRows || []).filter(
      x => mconfig.select.includes(x) && selectedDimensions.indexOf(x) > -1
    );

    let pivotColumns = (mconfig.chart.pivotColumns || []).filter(
      x =>
        mconfig.select.includes(x) &&
        selectedDimensions.indexOf(x) > -1 &&
        pivotRows.indexOf(x) < 0
    );

    selectedDimensions
      .filter(x => pivotRows.indexOf(x) < 0 && pivotColumns.indexOf(x) < 0)
      .forEach(fieldId => {
        if (pivotColumns.length === 0) {
          pivotColumns = [...pivotColumns, fieldId];
        } else {
          pivotRows = [...pivotRows, fieldId];
        }
      });

    let pivotValues = (mconfig.chart.pivotValues || []).filter(
      x => selectedMCsResultIsNumber.indexOf(x.field) > -1
    );

    selectedMCsResultIsNumber
      .filter(
        field =>
          pivotValues.map(pivotValue => pivotValue.field).indexOf(field) < 0
      )
      .forEach(field => {
        pivotValues = [
          ...pivotValues,
          {
            field: field
          }
        ];
      });

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
      sizeField: sizeField,
      pivotRows: pivotRows,
      pivotColumns: pivotColumns,
      pivotValues: pivotValues
    });

    mconfig = setChartSeries({ mconfig: mconfig });
  }

  return mconfig;
}
