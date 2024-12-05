import { common } from '~front/barrels/common';

export function getSelectValid(item: {
  chart: common.MconfigChart;
  mconfigFields: common.MconfigField[];
}) {
  let { chart, mconfigFields } = item;

  let xField = mconfigFields.find(f => f.id === chart.xField);
  let yField = mconfigFields.find(f => f.id === chart.yField);
  let sizeField = mconfigFields.find(f => f.id === chart.sizeField);

  let yFieldsIsOk = true;

  if (common.isDefined(chart.yFields)) {
    let yFields = mconfigFields.filter(f => chart.yFields.indexOf(f.id) > -1);

    let yFieldsResultIsNumber = yFields.filter(
      f => f.result === common.FieldResultEnum.Number
    );

    if (yFields.length !== yFieldsResultIsNumber.length) {
      yFieldsIsOk = false;
    }
  }

  let valueField = mconfigFields.find(f => f.id === chart.valueField);

  let previousValueField = mconfigFields.find(
    f => f.id === chart.previousValueField
  );

  let isSelectValid = true;
  let errorMessage;

  let selectedDimensions = mconfigFields.filter(
    x => x.fieldClass === common.FieldClassEnum.Dimension
  );

  let selectedDimensionsIsResultNumberOrTs = mconfigFields.filter(
    x =>
      x.fieldClass === common.FieldClassEnum.Dimension &&
      (x.result === common.FieldResultEnum.Number ||
        x.result === common.FieldResultEnum.Ts)
  );

  let selectedMeasuresAndCalculations = mconfigFields.filter(
    x =>
      x.fieldClass === common.FieldClassEnum.Measure ||
      x.fieldClass === common.FieldClassEnum.Calculation
  );

  if (chart.type === common.ChartTypeEnum.Table) {
    //
  } else if (
    chart.type === common.ChartTypeEnum.AgPie ||
    chart.type === common.ChartTypeEnum.AgDonut ||
    chart.type === common.ChartTypeEnum.BarVertical ||
    chart.type === common.ChartTypeEnum.BarHorizontal ||
    chart.type === common.ChartTypeEnum.Pie ||
    chart.type === common.ChartTypeEnum.PieAdvanced ||
    chart.type === common.ChartTypeEnum.PieGrid ||
    chart.type === common.ChartTypeEnum.TreeMap ||
    chart.type === common.ChartTypeEnum.Gauge
  ) {
    if (selectedDimensions.length === 0) {
      isSelectValid = false;
      errorMessage = 'Dimension field must be selected for this chart type';
    } else if (selectedDimensions.length > 1) {
      isSelectValid = false;
      errorMessage =
        'Only one Dimension field must be selected for this chart type';
    } else if (selectedMeasuresAndCalculations.length === 0) {
      isSelectValid = false;
      errorMessage =
        'Measure or Calculation field must be selected for this chart type';
    }
  } else if (chart.type === common.ChartTypeEnum.NumberCard) {
    if (selectedDimensions.length > 1) {
      isSelectValid = false;
      errorMessage =
        'Only one Dimension field can be selected for this chart type';
    } else if (selectedMeasuresAndCalculations.length === 0) {
      isSelectValid = false;
      errorMessage =
        'Measure or Calculation field must be selected for this chart type';
    }
  } else if (chart.type === common.ChartTypeEnum.GaugeLinear) {
    if (selectedDimensions.length > 0) {
      isSelectValid = false;
      errorMessage = 'Dimension fields can not be selected for this chart type';
    } else if (selectedMeasuresAndCalculations.length === 0) {
      isSelectValid = false;
      errorMessage =
        'Measure or Calculation field must be selected for this chart type';
    }
  } else if (
    chart.type === common.ChartTypeEnum.ELine ||
    chart.type === common.ChartTypeEnum.EBar ||
    chart.type === common.ChartTypeEnum.EScatter ||
    // chart.type === common.ChartTypeEnum.EBubble ||
    chart.type === common.ChartTypeEnum.AgLine ||
    chart.type === common.ChartTypeEnum.AgArea ||
    chart.type === common.ChartTypeEnum.AgBar ||
    chart.type === common.ChartTypeEnum.AgScatter ||
    chart.type === common.ChartTypeEnum.AgBubble ||
    chart.type === common.ChartTypeEnum.BarVerticalGrouped ||
    chart.type === common.ChartTypeEnum.BarHorizontalGrouped ||
    chart.type === common.ChartTypeEnum.BarVerticalStacked ||
    chart.type === common.ChartTypeEnum.BarHorizontalStacked ||
    chart.type === common.ChartTypeEnum.BarVerticalNormalized ||
    chart.type === common.ChartTypeEnum.BarHorizontalNormalized ||
    chart.type === common.ChartTypeEnum.Line ||
    chart.type === common.ChartTypeEnum.Area ||
    chart.type === common.ChartTypeEnum.AreaStacked ||
    chart.type === common.ChartTypeEnum.AreaNormalized ||
    chart.type === common.ChartTypeEnum.HeatMap
  ) {
    if (selectedDimensions.length === 0) {
      isSelectValid = false;
      errorMessage = 'Dimension field must be selected for this chart type';
    } else if (selectedDimensions.length > 2) {
      isSelectValid = false;
      errorMessage =
        'A maximum of 2 dimension fields can be selected for this chart type';
    } else if (
      selectedDimensionsIsResultNumberOrTs.length === 0 &&
      (chart.type === common.ChartTypeEnum.ELine ||
        chart.type === common.ChartTypeEnum.AgLine ||
        chart.type === common.ChartTypeEnum.AgArea ||
        chart.type === common.ChartTypeEnum.Line ||
        chart.type === common.ChartTypeEnum.Area ||
        chart.type === common.ChartTypeEnum.AreaStacked ||
        chart.type === common.ChartTypeEnum.AreaNormalized)
    ) {
      isSelectValid = false;
      errorMessage =
        'At least one of the selected dimensions for this chart type must have result type "number" or "ts"';
    } else if (
      common.isDefined(xField) &&
      xField.result !== common.FieldResultEnum.Ts &&
      xField.result !== common.FieldResultEnum.Number &&
      (chart.type === common.ChartTypeEnum.ELine ||
        chart.type === common.ChartTypeEnum.AgLine ||
        chart.type === common.ChartTypeEnum.AgArea ||
        chart.type === common.ChartTypeEnum.Line ||
        chart.type === common.ChartTypeEnum.Area ||
        chart.type === common.ChartTypeEnum.AreaStacked ||
        chart.type === common.ChartTypeEnum.AreaNormalized)
    ) {
      isSelectValid = false;
      errorMessage =
        'xField for this chart type must have result type "number" or "ts"';
    } else if (
      selectedDimensions.length === 2 &&
      selectedDimensions[0].topId === selectedDimensions[1].topId &&
      selectedDimensions[0].groupId === selectedDimensions[1].groupId &&
      selectedDimensions[0].result === common.FieldResultEnum.Ts &&
      selectedDimensions[1].result === common.FieldResultEnum.Ts
    ) {
      isSelectValid = false;
      errorMessage =
        'Two dimensions with result type TS from the same time group can be selected simultaneously only for the table chart';
    } else if (selectedMeasuresAndCalculations.length === 0) {
      isSelectValid = false;
      errorMessage =
        'Measure or Calculation field must be selected for this chart type';
    } else if (
      common.isDefined(yField) &&
      yField.result !== common.FieldResultEnum.Number
    ) {
      isSelectValid = false;
      errorMessage =
        'yField for this chart type must have result type "number"';
    } else if (
      common.isDefined(sizeField) &&
      sizeField.result !== common.FieldResultEnum.Number
    ) {
      isSelectValid = false;
      errorMessage =
        'sizeField for this chart type must have result type "number"';
    } else if (
      common.isDefined(valueField) &&
      valueField.result !== common.FieldResultEnum.Number
    ) {
      isSelectValid = false;
      errorMessage =
        'valueField for this chart type must have result type "number"';
    } else if (
      common.isDefined(previousValueField) &&
      previousValueField.result !== common.FieldResultEnum.Number
    ) {
      isSelectValid = false;
      errorMessage =
        'previousValueField for this chart type must have result type "number"';
    } else if (yFieldsIsOk === false) {
      isSelectValid = false;
      errorMessage =
        'Each yFields element for this chart type must have result type "number"';
    }
  }

  return { isSelectValid: isSelectValid, errorMessage: errorMessage };
}
