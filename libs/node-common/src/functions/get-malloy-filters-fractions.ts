import {
  ExpressionWithFieldReference,
  FilterWithFilterString
} from '@malloydata/malloy-interfaces';
import {
  ASTFilter,
  ASTFilterWithFilterString,
  ASTHavingViewOperation,
  ASTSegmentViewDefinition,
  ASTViewOperation,
  ASTWhereViewOperation,
  ParsedFilter
} from '@malloydata/malloy-query-builder';
import { FieldResultEnum } from '#common/enums/field-result.enum';
import { isDefined } from '#common/functions/is-defined';
import { Fraction } from '#common/interfaces/blockml/fraction';
import { Model } from '#common/interfaces/blockml/model';
import { getMalloyFilterBooleanFractions } from './get-malloy-filter-boolean-fractions';
import { getMalloyFilterNumberFractions } from './get-malloy-filter-number-fractions';
import { getMalloyFilterStringFractions } from './get-malloy-filter-string-fractions';
import { getMalloyFilterTsFractions } from './get-malloy-filter-ts-fractions';

export function getMalloyFiltersFractions(item: {
  segment: ASTSegmentViewDefinition;
  apiModel: Model;
}) {
  let { segment, apiModel } = item;

  let filtersFractions: {
    [s: string]: Fraction[];
  } = {};

  let parsedFilters: ParsedFilter[] = []; // for logs

  segment.operations.items
    .filter(
      (operation: ASTViewOperation) =>
        operation instanceof ASTWhereViewOperation ||
        operation instanceof ASTHavingViewOperation
    )
    .map((op: ASTWhereViewOperation | ASTHavingViewOperation) => {
      let astFilter: ASTFilter = op.filter;

      let parsedFilter: ParsedFilter = (
        astFilter as ASTFilterWithFilterString
      ).getFilter();

      parsedFilters.push(parsedFilter); // for logs

      let exp = op.node.filter.expression as ExpressionWithFieldReference;

      let fieldId = isDefined(exp.path)
        ? [...exp.path, exp.name].join('.')
        : exp.name;

      let field = apiModel.fields.find(k => k.id === fieldId);

      let parentBrick = `f\`${(op.node.filter as FilterWithFilterString).filter}\``;

      let fractions: Fraction[] =
        field.result === FieldResultEnum.String &&
        parsedFilter.kind === 'string'
          ? getMalloyFilterStringFractions({
              parentBrick: parentBrick,
              parsed: parsedFilter.parsed
            }).fractions
          : field.result === FieldResultEnum.Boolean &&
              parsedFilter.kind === 'boolean'
            ? getMalloyFilterBooleanFractions({
                parentBrick: parentBrick,
                parsed: parsedFilter.parsed
              }).fractions
            : field.result === FieldResultEnum.Number &&
                parsedFilter.kind === 'number'
              ? getMalloyFilterNumberFractions({
                  parentBrick: parentBrick,
                  parsed: parsedFilter.parsed
                }).fractions
              : [FieldResultEnum.Ts, FieldResultEnum.Date].indexOf(
                    field.result
                  ) > -1 &&
                  (parsedFilter.kind === 'timestamp' ||
                    parsedFilter.kind === 'date')
                ? getMalloyFilterTsFractions({
                    parentBrick: parentBrick,
                    parsed: parsedFilter.parsed,
                    isGetTimeRange: false
                  }).fractions
                : [];

      if (isDefined(filtersFractions[fieldId])) {
        filtersFractions[fieldId] = [
          ...filtersFractions[fieldId],
          ...fractions
        ];
      } else {
        filtersFractions[fieldId] = [...fractions];
      }

      return op.filter;
    });

  return { filtersFractions: filtersFractions, parsedFilters: parsedFilters };
}
