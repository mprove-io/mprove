import { isDefined } from '#common/functions/is-defined/is-defined';
import type { QueryOperationType } from '#common/types/backend/parts/query-operation/query-operation-type';
import type { Mconfig } from '#common/types/blockml/parts/mconfig/mconfig';
import type { ModelField } from '#common/types/blockml/parts/model/model-field';

export function sortFieldsOnSelectChange<T extends Mconfig>(item: {
  mconfig: T;
  selectFieldId: string;
  modelFields: ModelField[];
  mconfigFields: ModelField[];
}) {
  let { mconfig, selectFieldId, modelFields, mconfigFields } = item;

  let prevDimensions = mconfig.select.filter(
    fieldId =>
      mconfigFields.find(x => x.id === fieldId).fieldClass === 'dimension'
  );

  let prevMeasuresAndCalculations = mconfig.select.filter(
    fieldId =>
      mconfigFields.find(x => x.id === fieldId).fieldClass !== 'dimension'
  );

  let selectedModelField = modelFields.find(x => x.id === selectFieldId);

  let sortFieldId;

  let desc = true;

  if (
    mconfig.select.indexOf(selectFieldId) > -1 &&
    mconfig.sortings.length === 1 &&
    mconfig.sortings.map(s => s.fieldId).indexOf(selectFieldId) > -1 &&
    selectedModelField.fieldClass === 'dimension' &&
    prevDimensions.length > 1
  ) {
    // remove sorted dimension - sort by other dimension
    sortFieldId = prevDimensions.filter(x => x !== selectFieldId)[0];
    desc = false;
  } else if (
    mconfig.select.indexOf(selectFieldId) > -1 &&
    mconfig.sortings.length === 1 &&
    mconfig.sortings.map(s => s.fieldId).indexOf(selectFieldId) > -1 &&
    selectedModelField.fieldClass === 'measure' &&
    prevMeasuresAndCalculations.length === 1 &&
    prevDimensions.length > 0
  ) {
    // remove single sorted measure - sort by dimension
    sortFieldId = prevDimensions[0];
    desc = false;
  } else if (
    mconfig.select.indexOf(selectFieldId) > -1 &&
    mconfig.sortings.length === 1 &&
    mconfig.sortings.map(s => s.fieldId).indexOf(selectFieldId) > -1 &&
    selectedModelField.fieldClass === 'measure' &&
    prevMeasuresAndCalculations.length > 1
  ) {
    // remove sorted measure - sort by other measure
    sortFieldId = prevMeasuresAndCalculations.filter(
      x => x !== selectFieldId
    )[0];
    desc = true;
  } else if (
    mconfig.select.indexOf(selectFieldId) < 0 &&
    mconfig.sortings.length === 0 &&
    selectedModelField.fieldClass === 'dimension' &&
    prevDimensions.length === 0 &&
    prevMeasuresAndCalculations.length > 0
  ) {
    // sort by added dimension or existing measure
    if (
      selectedModelField.result === 'string' ||
      selectedModelField.result === 'number'
    ) {
      sortFieldId = prevMeasuresAndCalculations[0];
      desc = true;
    } else {
      sortFieldId = selectedModelField.id;
      desc = false;
    }
  } else if (
    mconfig.select.indexOf(selectFieldId) < 0 &&
    mconfig.sortings.length === 0 &&
    selectedModelField.fieldClass === 'dimension'
  ) {
    // sort by added dimension
    sortFieldId = selectedModelField.id;
    desc = false;
  } else if (
    mconfig.select.indexOf(selectFieldId) < 0 &&
    mconfig.sortings.length === 0 &&
    prevDimensions.length > 0 &&
    selectedModelField.fieldClass === 'measure'
  ) {
    // sort by added measure
    sortFieldId = selectedModelField.id;
    desc = true;
  }

  let queryOperationType: QueryOperationType =
    mconfig.select.length === 1 && mconfig.select[0] === selectFieldId
      ? 'Remove'
      : isDefined(sortFieldId)
        ? 'GroupOrAggregatePlusSort'
        : 'GroupOrAggregate';

  return {
    queryOperationType: queryOperationType,
    sortFieldId:
      queryOperationType === 'GroupOrAggregatePlusSort'
        ? sortFieldId
        : undefined,
    desc:
      queryOperationType === 'GroupOrAggregatePlusSort' &&
      isDefined(sortFieldId)
        ? desc
        : undefined
  };
}
