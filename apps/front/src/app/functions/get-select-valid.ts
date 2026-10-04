import { isDefined } from '#common/functions/is-defined/is-defined';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { MconfigField } from '#common/types/backend/parts/mconfig/mconfig-field';
import type { MconfigChart } from '#common/types/blockml/parts/mconfig/mconfig-chart';

export function getSelectValid(item: {
  chart: MconfigChart;
  mconfigFields: MconfigField[];
  isStoreModel: boolean;
}) {
  let { chart, mconfigFields, isStoreModel } = item;

  let xField = mconfigFields.find(f => f.id === chart.xField);
  let sizeField = mconfigFields.find(f => f.id === chart.sizeField);

  let yFieldsIsOk = true;

  if (isDefined(chart.yFields)) {
    let yFields = mconfigFields.filter(f => chart.yFields.indexOf(f.id) > -1);

    let yFieldsResultIsNumber = yFields.filter(f => f.result === 'number');

    if (yFields.length !== yFieldsResultIsNumber.length) {
      yFieldsIsOk = false;
    }
  }

  let isSelectValid = true;
  let errorMessage;

  let selectedDimensions = mconfigFields.filter(
    x => x.fieldClass === 'dimension'
  );

  let selectedDimensionsResultForXField = mconfigFields.filter(
    x =>
      x.fieldClass === 'dimension' &&
      ((isStoreModel === true && isDefined(x.detail)) ||
        x.result === 'number' ||
        x.result === 'ts' ||
        x.result === 'day_of_week' ||
        x.result === 'day_of_week_index' ||
        x.result === 'month_name' ||
        x.result === 'quarter_of_year')
  );

  let selectedMeasuresAndCalculations = mconfigFields.filter(
    x => x.fieldClass === 'measure' || x.fieldClass === 'calculation'
  );

  let pivotRows = chart.pivotRows || [];
  let pivotColumns = chart.pivotColumns || [];
  let pivotValues = chart.pivotValues || [];
  let pivotGroupFields = [...pivotRows, ...pivotColumns];

  if (chart.type === 'table') {
    //
  } else if (chart.type === 'pivot_table') {
    let selectedPivotGroupFields = mconfigFields.filter(
      field => pivotGroupFields.indexOf(field.id) > -1
    );

    let duplicatedPivotGroupFields = pivotRows.filter(
      fieldId => pivotColumns.indexOf(fieldId) > -1
    );

    let pivotValueFields = mconfigFields.filter(
      field => pivotValues.map(value => value.field).indexOf(field.id) > -1
    );

    let invalidPivotValueFields = pivotValueFields.filter(
      field => field.result !== 'number'
    );

    if (pivotRows.length === 0 && pivotColumns.length === 0) {
      isSelectValid = false;
      errorMessage = 'Row or Column must be selected for this chart type';
    } else if (selectedPivotGroupFields.length !== pivotGroupFields.length) {
      isSelectValid = false;
      errorMessage = 'Pivot group fields must be selected fields';
    } else if (
      selectedPivotGroupFields.filter(field => field.fieldClass !== 'dimension')
        .length > 0
    ) {
      isSelectValid = false;
      errorMessage = 'Pivot group fields must be Dimensions';
    } else if (duplicatedPivotGroupFields.length > 0) {
      isSelectValid = false;
      errorMessage = 'Pivot row and column groups cannot use the same field';
    } else if (pivotValues.length === 0) {
      isSelectValid = false;
      errorMessage = 'Pivot Value field must be selected for this chart type';
    } else if (pivotValueFields.length !== pivotValues.length) {
      isSelectValid = false;
      errorMessage = 'Pivot Value fields must be selected fields';
    } else if (invalidPivotValueFields.length > 0) {
      isSelectValid = false;
      errorMessage = 'Pivot Value fields must be numeric';
    }
  } else if (chart.type === 'single') {
    if (selectedDimensions.length > 0) {
      isSelectValid = false;
      errorMessage = 'Dimensions cannot be selected for this chart type';
    } else if (selectedMeasuresAndCalculations.length === 0) {
      isSelectValid = false;
      errorMessage =
        'Measure or Calculation field must be selected for this chart type';
    }
  } else if (chart.type === 'pie') {
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
  } else if (
    chart.type === 'line' ||
    chart.type === 'bar' ||
    chart.type === 'scatter'
  ) {
    if (selectedDimensions.length === 0) {
      isSelectValid = false;
      errorMessage = 'Dimension field must be selected for this chart type';
    } else if (selectedDimensions.length > 2 && chart.type !== 'scatter') {
      isSelectValid = false;
      errorMessage =
        'A maximum of 2 dimension fields can be selected for this chart type';
    } else if (
      selectedDimensionsResultForXField.length === 0 &&
      chart.type === 'line'
    ) {
      isSelectValid = false;
      errorMessage =
        'At least one of the selected dimensions for this chart type must have result type "number", "ts", "day_of_week", "day_of_week_index", "month_name", "quarter_of_year"';
    } else if (
      isDefined(xField) &&
      isStoreModel === true &&
      isUndefined(xField.detail) &&
      xField.result !== 'number' &&
      xField.result !== 'ts' &&
      xField.result !== 'day_of_week' &&
      xField.result !== 'day_of_week_index' &&
      xField.result !== 'month_name' &&
      xField.result !== 'quarter_of_year' &&
      chart.type === 'line'
    ) {
      isSelectValid = false;
      errorMessage =
        isStoreModel === true
          ? 'xField for this chart type must have result type "number" or time_group with detail specified'
          : 'xField for this chart type must have result type "number", "ts", "day_of_week", "day_of_week_index", "month_name", "quarter_of_year"';
    } else if (
      selectedDimensions.length === 2 &&
      selectedDimensions[0].topId === selectedDimensions[1].topId &&
      selectedDimensions[0].groupId === selectedDimensions[1].groupId &&
      (selectedDimensions[0].result === 'ts' ||
        (isStoreModel === true && isDefined(selectedDimensions[0].detail))) &&
      (selectedDimensions[1].result === 'ts' ||
        (isStoreModel === true && isDefined(selectedDimensions[1].detail)))
    ) {
      isSelectValid = false;
      errorMessage =
        isStoreModel === true
          ? 'Two dimensions with detail specified from the same time group can be selected simultaneously only for the table chart'
          : 'Two dimensions with result type TS from the same time group can be selected simultaneously only for the table chart';
    } else if (
      selectedMeasuresAndCalculations.length === 0 &&
      chart.type !== 'scatter'
    ) {
      isSelectValid = false;
      errorMessage =
        'Measure or Calculation field must be selected for this chart type';
    } else if (isDefined(sizeField) && sizeField.result !== 'number') {
      isSelectValid = false;
      errorMessage =
        'sizeField for this chart type must have result type "number"';
    } else if (yFieldsIsOk === false) {
      isSelectValid = false;
      errorMessage =
        'Each element of yFields for this chart type must have result type "number"';
    }
  }

  return { isSelectValid: isSelectValid, errorMessage: errorMessage };
}
