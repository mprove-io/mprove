import {
  ASTHavingViewOperation,
  ASTSegmentViewDefinition,
  ASTViewOperation,
  ASTWhereViewOperation
} from '@malloydata/malloy-query-builder';
import { MALLOY_FILTER_ANY } from '#common/constants/top';
import { FieldClassEnum } from '#common/enums/field-class.enum';
import { FieldResultEnum } from '#common/enums/field-result.enum';
import { FractionOperatorEnum } from '#common/enums/fraction/fraction-operator.enum';
import { FractionTypeEnum } from '#common/enums/fraction/fraction-type.enum';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { Filter } from '#common/zod/blockml/filter';
import type { Fraction } from '#common/zod/blockml/fraction';
import type { Model } from '#common/zod/blockml/model';
import { getMalloyFiltersFractions } from '#node-common/functions/malloy/make-malloy-query/process-malloy-where-or-having/get-malloy-filters-fractions/get-malloy-filters-fractions';

export function processMalloyWhereOrHaving(item: {
  model: Model;
  queryOperationFilters: Filter[];
  segment0: ASTSegmentViewDefinition;
  timezone: string;
}) {
  let { model, queryOperationFilters, segment0, timezone } = item;

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
    if (isUndefined(filter.fieldId)) {
      isError = true;
      errorMessage = `filter.fieldId is not defined (QueryOperationTypeEnum.WhereOrHaving)`;
    }

    let modelField = model.fields.find(x => x.id === filter.fieldId);

    if (isUndefined(modelField)) {
      isError = true;
      errorMessage = `modelField is not defined (filter.fieldId: ${filter.fieldId})`;
    }

    let anyValues = filter.fractions.filter(
      fraction => fraction.brick === MALLOY_FILTER_ANY
    );

    let booleanValues = filter.fractions.filter(
      fraction =>
        [
          FractionTypeEnum.BooleanIsTrue,
          FractionTypeEnum.BooleanIsTruthy,
          FractionTypeEnum.BooleanIsFalse,
          FractionTypeEnum.BooleanIsFalsy,
          FractionTypeEnum.BooleanIsNull,
          FractionTypeEnum.BooleanIsNotTrue,
          FractionTypeEnum.BooleanIsNotFalse,
          FractionTypeEnum.BooleanIsNotFalsy,
          FractionTypeEnum.BooleanIsNotNull
        ].indexOf(fraction.type) > -1
    );

    let ORs = filter.fractions.filter(
      fraction =>
        fraction.operator === FractionOperatorEnum.Or &&
        fraction.brick !== MALLOY_FILTER_ANY &&
        [
          FractionTypeEnum.BooleanIsTrue,
          FractionTypeEnum.BooleanIsTruthy,
          FractionTypeEnum.BooleanIsFalse,
          FractionTypeEnum.BooleanIsFalsy,
          FractionTypeEnum.BooleanIsNull,
          FractionTypeEnum.BooleanIsNotTrue,
          FractionTypeEnum.BooleanIsNotFalse,
          FractionTypeEnum.BooleanIsNotFalsy,
          FractionTypeEnum.BooleanIsNotNull
        ].indexOf(fraction.type) < 0
    );

    let ANDs = filter.fractions.filter(
      fraction =>
        fraction.operator === FractionOperatorEnum.And &&
        fraction.brick !== MALLOY_FILTER_ANY &&
        [
          FractionTypeEnum.BooleanIsTrue,
          FractionTypeEnum.BooleanIsTruthy,
          FractionTypeEnum.BooleanIsFalse,
          FractionTypeEnum.BooleanIsFalsy,
          FractionTypeEnum.BooleanIsNull,
          FractionTypeEnum.BooleanIsNotTrue,
          FractionTypeEnum.BooleanIsNotFalse,
          FractionTypeEnum.BooleanIsNotFalsy,
          FractionTypeEnum.BooleanIsNotNull
        ].indexOf(fraction.type) < 0
    );

    let filterModelFields = [modelField];

    if (
      modelField.result === FieldResultEnum.Ts &&
      isDefined(modelField.timeframe) &&
      isDefined(modelField.malloyBaseFieldId)
    ) {
      let baseModelField = model.fields.find(
        x =>
          x.id === modelField.malloyBaseFieldId &&
          x.result === FieldResultEnum.Ts
      );

      // if (isDefined(baseModelField) && timezone === UTC) {
      filterModelFields = [baseModelField];
      // } else if (isDefined(baseModelField)) {
      // filterModelFields = [baseModelField, modelField];
      // }
    }

    filterModelFields.forEach(filterModelField => {
      let filterFieldName = filterModelField.malloyFieldName;
      let filterFieldPath: string[] = filterModelField.malloyFieldPath;

      if (ORs.length > 0) {
        let fstrORs =
          filterModelField.result === FieldResultEnum.String
            ? ORs.map(fraction => fraction.brick.slice(2, -1)).join(', ')
            : filterModelField.result === FieldResultEnum.Number
              ? ORs.map(fraction => fraction.brick.slice(2, -1)).join(' or ')
              : filterModelField.result === FieldResultEnum.Ts
                ? ORs.map(fraction => fraction.brick.slice(2, -1)).join(' or ')
                : filterModelField.result === FieldResultEnum.Date
                  ? ORs.map(fraction => fraction.brick.slice(2, -1)).join(
                      ' or '
                    )
                  : undefined;

        if (modelField.fieldClass === FieldClassEnum.Dimension) {
          segment0.addWhere(filterFieldName, filterFieldPath, fstrORs);
        } else {
          segment0.addHaving(filterFieldName, filterFieldPath, fstrORs);
        }
      }

      if (ANDs.length > 0) {
        ANDs.map(y => y.brick.slice(2, -1)).forEach(fstr => {
          if (modelField.fieldClass === FieldClassEnum.Dimension) {
            segment0.addWhere(filterFieldName, filterFieldPath, fstr);
          } else {
            segment0.addHaving(filterFieldName, filterFieldPath, fstr);
          }
        });
      }

      // if (ANDs.length > 0) {
      //   let fstrANDs =
      //     filterModelField.result === FieldResultEnum.String
      //       ? ANDs.map(y => y.brick.slice(2, -1)).join(', ')
      //       : filterModelField.result === FieldResultEnum.Number
      //         ? ANDs.map(y => y.brick.slice(2, -1)).join(' and ')
      //         : filterModelField.result === FieldResultEnum.Ts
      //           ? ANDs.map(y => y.brick.slice(2, -1)).join(' and ')
      //           : filterModelField.result === FieldResultEnum.Date
      //             ? ANDs.map(y => y.brick.slice(2, -1)).join(' and ')
      //             : undefined;

      //   if (modelField.fieldClass === FieldClassEnum.Dimension) {
      //     segment0.addWhere(filterFieldName, filterFieldPath, fstrANDs);
      //   } else {
      //     segment0.addHaving(filterFieldName, filterFieldPath, fstrANDs);
      //   }
      // }

      if (booleanValues.length > 0) {
        booleanValues.forEach(x => {
          let fstrAny = x.brick.slice(2, -1);

          if (modelField.fieldClass === FieldClassEnum.Dimension) {
            segment0.addWhere(filterFieldName, filterFieldPath, fstrAny);
          } else {
            segment0.addHaving(filterFieldName, filterFieldPath, fstrAny);
          }
        });
      }

      if (anyValues.length > 0) {
        anyValues.forEach(x => {
          let fstrAny = '';

          if (modelField.fieldClass === FieldClassEnum.Dimension) {
            segment0.addWhere(filterFieldName, filterFieldPath, fstrAny);
          } else {
            segment0.addHaving(filterFieldName, filterFieldPath, fstrAny);
          }
        });
      }
    });
  });

  let { filtersFractions, parsedFilters } = getMalloyFiltersFractions({
    segment: segment0,
    apiModel: model
  });

  let mconfigFiltersFractions: {
    [s: string]: Fraction[];
  } = {};

  queryOperationFilters.forEach(filter => {
    let filterFieldIdIsDefined = isDefined(filter.fieldId);

    if (filterFieldIdIsDefined) {
      let modelField = model.fields.find(x => x.id === filter.fieldId);

      let shouldUseOriginalFractions =
        isDefined(modelField) && modelField.result === FieldResultEnum.Ts;

      mconfigFiltersFractions[filter.fieldId] = shouldUseOriginalFractions
        ? filter.fractions
        : filtersFractions[filter.fieldId];
    }
  });

  return {
    filtersFractions: mconfigFiltersFractions,
    parsedFilters: parsedFilters,
    isError: isError,
    errorMessage: errorMessage
  };
}
