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
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { FieldResult } from '#common/types/blockml/parts/field/field-result';
import type { Fraction } from '#common/types/blockml/parts/fraction/fraction';
import type { Model } from '#common/types/blockml/parts/model/model';
import { getMalloyFilterBooleanFractions } from '#node-common/functions/malloy/get-malloy-filter-boolean-fractions/get-malloy-filter-boolean-fractions';
import { getMalloyFilterNumberFractions } from '#node-common/functions/malloy/get-malloy-filter-number-fractions/get-malloy-filter-number-fractions';
import { getMalloyFilterStringFractions } from '#node-common/functions/malloy/get-malloy-filter-string-fractions/get-malloy-filter-string-fractions';
import { getMalloyFilterTsFractions } from '#node-common/functions/malloy/get-malloy-filter-ts-fractions/get-malloy-filter-ts-fractions';

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
        field.result === 'string' && parsedFilter.kind === 'string'
          ? getMalloyFilterStringFractions({
              parentBrick: parentBrick,
              parsed: parsedFilter.parsed
            }).fractions
          : field.result === 'boolean' && parsedFilter.kind === 'boolean'
            ? getMalloyFilterBooleanFractions({
                parentBrick: parentBrick,
                parsed: parsedFilter.parsed
              }).fractions
            : field.result === 'number' && parsedFilter.kind === 'number'
              ? getMalloyFilterNumberFractions({
                  parentBrick: parentBrick,
                  parsed: parsedFilter.parsed
                }).fractions
              : (['ts', 'date'] satisfies FieldResult[]).findIndex(
                    candidate => candidate === field.result
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
