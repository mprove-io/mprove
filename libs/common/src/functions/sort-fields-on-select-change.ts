import { FieldClassEnum } from '#common/enums/field-class.enum';
import { FieldResultEnum } from '#common/enums/field-result.enum';
import { QueryOperationTypeEnum } from '#common/enums/query-operation-type.enum';
import { Mconfig } from '#common/interfaces/blockml/mconfig';
import { ModelField } from '#common/interfaces/blockml/model-field';
import { isDefined } from './is-defined';

export function sortFieldsOnSelectChange<T extends Mconfig>(item: {
  mconfig: T;
  selectFieldId: string;
  modelFields: ModelField[];
  mconfigFields: ModelField[];
}) {
  let { mconfig, selectFieldId, modelFields, mconfigFields } = item;

  let prevDimensions = mconfig.select.filter(
    fieldId =>
      mconfigFields.find(x => x.id === fieldId).fieldClass ===
      FieldClassEnum.Dimension
  );

  let prevMeasuresAndCalculations = mconfig.select.filter(
    fieldId =>
      mconfigFields.find(x => x.id === fieldId).fieldClass !==
      FieldClassEnum.Dimension
  );

  let selectedModelField = modelFields.find(x => x.id === selectFieldId);

  let sortFieldId;

  let desc = true;

  if (
    mconfig.select.indexOf(selectFieldId) > -1 &&
    mconfig.sortings.length === 1 &&
    mconfig.sortings.map(s => s.fieldId).indexOf(selectFieldId) > -1 &&
    selectedModelField.fieldClass === FieldClassEnum.Dimension &&
    prevDimensions.length > 1
  ) {
    // remove sorted dimension - sort by other dimension
    sortFieldId = prevDimensions.filter(x => x !== selectFieldId)[0];
    desc = false;
  } else if (
    mconfig.select.indexOf(selectFieldId) > -1 &&
    mconfig.sortings.length === 1 &&
    mconfig.sortings.map(s => s.fieldId).indexOf(selectFieldId) > -1 &&
    selectedModelField.fieldClass === FieldClassEnum.Measure &&
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
    selectedModelField.fieldClass === FieldClassEnum.Measure &&
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
    selectedModelField.fieldClass === FieldClassEnum.Dimension &&
    prevDimensions.length === 0 &&
    prevMeasuresAndCalculations.length > 0
  ) {
    // sort by added dimension or existing measure
    if (
      selectedModelField.result === FieldResultEnum.String ||
      selectedModelField.result === FieldResultEnum.Number
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
    selectedModelField.fieldClass === FieldClassEnum.Dimension
  ) {
    // sort by added dimension
    sortFieldId = selectedModelField.id;
    desc = false;
  } else if (
    mconfig.select.indexOf(selectFieldId) < 0 &&
    mconfig.sortings.length === 0 &&
    prevDimensions.length > 0 &&
    selectedModelField.fieldClass === FieldClassEnum.Measure
  ) {
    // sort by added measure
    sortFieldId = selectedModelField.id;
    desc = true;
  }

  let queryOperationType =
    mconfig.select.length === 1 && mconfig.select[0] === selectFieldId
      ? QueryOperationTypeEnum.Remove
      : isDefined(sortFieldId)
        ? QueryOperationTypeEnum.GroupOrAggregatePlusSort
        : QueryOperationTypeEnum.GroupOrAggregate;

  return {
    queryOperationType: queryOperationType,
    sortFieldId:
      queryOperationType === QueryOperationTypeEnum.GroupOrAggregatePlusSort
        ? sortFieldId
        : undefined,
    desc:
      queryOperationType === QueryOperationTypeEnum.GroupOrAggregatePlusSort &&
      isDefined(sortFieldId)
        ? desc
        : undefined
  };
}
