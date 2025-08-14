import {
  ASTHavingViewOperation,
  ASTSegmentViewDefinition,
  ASTViewOperation,
  ASTWhereViewOperation
} from '@malloydata/malloy-query-builder';
import { MALLOY_FILTER_ANY } from '~common/_index';
import { common } from '~node-common/barrels/common';
import { getMalloyFiltersFractions } from './get-malloy-filters-fractions';

export function processMalloyWhereOrHaving(item: {
  model: common.Model;
  queryOperationFilters: common.Filter[];
  segment0: ASTSegmentViewDefinition;
}) {
  let { model, queryOperationFilters, segment0 } = item;

  let isError = false;
  let errorMessage: string;

  segment0.operations.items
    .filter(
      (operation: ASTViewOperation) =>
        operation instanceof ASTWhereViewOperation ||
        operation instanceof ASTHavingViewOperation
    )
    .forEach(item => {
      item.delete();
    });

  queryOperationFilters.forEach(filter => {
    if (common.isUndefined(filter.fieldId)) {
      isError = true;
      errorMessage = `filter.fieldId is not defined (QueryOperationTypeEnum.WhereOrHaving)`;
    }

    let modelField = model.fields.find(x => x.id === filter.fieldId);

    if (common.isUndefined(modelField)) {
      isError = true;
      errorMessage = `modelField is not defined (filter.fieldId: ${filter.fieldId})`;
    }

    let anyValues = filter.fractions.filter(
      fraction => fraction.brick === MALLOY_FILTER_ANY
    );

    let booleanValues = filter.fractions.filter(
      fraction =>
        [
          common.FractionTypeEnum.BooleanIsTrue,
          common.FractionTypeEnum.BooleanIsFalse,
          common.FractionTypeEnum.BooleanIsFalseOrNull,
          common.FractionTypeEnum.BooleanIsNull,
          common.FractionTypeEnum.BooleanIsNotTrue,
          common.FractionTypeEnum.BooleanIsNotFalse,
          common.FractionTypeEnum.BooleanIsNotFalseOrNull,
          common.FractionTypeEnum.BooleanIsNotNull
        ].indexOf(fraction.type) > -1
    );

    let ORs = filter.fractions.filter(
      fraction =>
        fraction.operator === common.FractionOperatorEnum.Or &&
        fraction.brick !== MALLOY_FILTER_ANY &&
        [
          common.FractionTypeEnum.BooleanIsTrue,
          common.FractionTypeEnum.BooleanIsFalse,
          common.FractionTypeEnum.BooleanIsFalseOrNull,
          common.FractionTypeEnum.BooleanIsNull,
          common.FractionTypeEnum.BooleanIsNotTrue,
          common.FractionTypeEnum.BooleanIsNotFalse,
          common.FractionTypeEnum.BooleanIsNotFalseOrNull,
          common.FractionTypeEnum.BooleanIsNotNull
        ].indexOf(fraction.type) < 0
    );

    let ANDs = filter.fractions.filter(
      fraction =>
        fraction.operator === common.FractionOperatorEnum.And &&
        fraction.brick !== MALLOY_FILTER_ANY &&
        [
          common.FractionTypeEnum.BooleanIsTrue,
          common.FractionTypeEnum.BooleanIsFalse,
          common.FractionTypeEnum.BooleanIsFalseOrNull,
          common.FractionTypeEnum.BooleanIsNull,
          common.FractionTypeEnum.BooleanIsNotTrue,
          common.FractionTypeEnum.BooleanIsNotFalse,
          common.FractionTypeEnum.BooleanIsNotFalseOrNull,
          common.FractionTypeEnum.BooleanIsNotNull
        ].indexOf(fraction.type) < 0
    );

    let filterModelField = model.fields.find(x => x.id === filter.fieldId);

    let filterFieldName = filterModelField.malloyFieldName;
    let filterFieldPath: string[] = filterModelField.malloyFieldPath;

    if (ORs.length > 0) {
      let fstrORs =
        filterModelField.result === common.FieldResultEnum.String
          ? ORs.map(fraction => fraction.brick.slice(2, -1)).join(', ')
          : filterModelField.result === common.FieldResultEnum.Number
            ? ORs.map(fraction => fraction.brick.slice(2, -1)).join(' or ')
            : // : filterModelField.result === common.FieldResultEnum.Boolean
              //   ? ORs.map(y => y.brick.slice(2, -1)).join(' or ')
              filterModelField.result === common.FieldResultEnum.Ts
              ? ORs.map(fraction => fraction.brick.slice(2, -1)).join(' or ')
              : filterModelField.result === common.FieldResultEnum.Date
                ? ORs.map(fraction => fraction.brick.slice(2, -1)).join(' or ')
                : undefined;

      if (modelField.fieldClass === common.FieldClassEnum.Dimension) {
        segment0.addWhere(filterFieldName, filterFieldPath, fstrORs);
      } else {
        segment0.addHaving(filterFieldName, filterFieldPath, fstrORs);
      }
    }

    if (ANDs.length > 0) {
      let fstrANDs =
        filterModelField.result === common.FieldResultEnum.String
          ? ANDs.map(y => y.brick.slice(2, -1)).join(', ')
          : filterModelField.result === common.FieldResultEnum.Number
            ? ANDs.map(y => y.brick.slice(2, -1)).join(' and ')
            : // : filterModelField.result === common.FieldResultEnum.Boolean
              //   ? ANDs.map(y => y.brick.slice(2, -1)).join(' and ')
              filterModelField.result === common.FieldResultEnum.Ts
              ? ANDs.map(y => y.brick.slice(2, -1)).join(' and ')
              : filterModelField.result === common.FieldResultEnum.Date
                ? ANDs.map(y => y.brick.slice(2, -1)).join(' and ')
                : undefined;

      if (modelField.fieldClass === common.FieldClassEnum.Dimension) {
        segment0.addWhere(filterFieldName, filterFieldPath, fstrANDs);
      } else {
        segment0.addHaving(filterFieldName, filterFieldPath, fstrANDs);
      }
    }

    if (booleanValues.length > 0) {
      booleanValues.forEach(x => {
        let fstrAny = x.brick.slice(2, -1);

        if (modelField.fieldClass === common.FieldClassEnum.Dimension) {
          segment0.addWhere(filterFieldName, filterFieldPath, fstrAny);
        } else {
          segment0.addHaving(filterFieldName, filterFieldPath, fstrAny);
        }
      });
    }

    if (anyValues.length > 0) {
      anyValues.forEach(x => {
        let fstrAny = '';

        if (modelField.fieldClass === common.FieldClassEnum.Dimension) {
          segment0.addWhere(filterFieldName, filterFieldPath, fstrAny);
        } else {
          segment0.addHaving(filterFieldName, filterFieldPath, fstrAny);
        }
      });
    }
  });

  let { filtersFractions, parsedFilters } = getMalloyFiltersFractions({
    segment: segment0,
    apiModel: model
  });

  return {
    filtersFractions: filtersFractions,
    parsedFilters: parsedFilters,
    isError: isError,
    errorMessage: errorMessage
  };
}
