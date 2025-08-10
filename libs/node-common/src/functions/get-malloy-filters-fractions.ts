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
import { common } from '~node-common/barrels/common';
import { getMalloyFilterBooleanFractions } from './get-malloy-filter-boolean-fractions';
import { getMalloyFilterNumberFractions } from './get-malloy-filter-number-fractions';
import { getMalloyFilterStringFractions } from './get-malloy-filter-string-fractions';
import { getMalloyFilterTsFractions } from './get-malloy-filter-ts-fractions';

// packages/malloy-filter/src/clause_utils.ts

// export function malloyUnescape(str: string) {
//   return str.replace(/\\(.)/g, '$1');
// }

// export function malloyEscape(str: string) {
//   const lstr = str.toLowerCase();
//   if (lstr === 'null' || lstr === 'empty') {
//     return '\\' + str;
//   }
//   return str.replace(/([,; |()\\%_-])/g, '\\$1');
// }

export function getMalloyFiltersFractions(item: {
  segment: ASTSegmentViewDefinition;
  apiModel: common.Model;
}) {
  let { segment, apiModel } = item;

  let filtersFractions: {
    [s: string]: common.Fraction[];
  } = {};

  let parsedFilters: ParsedFilter[] = []; // for logs

  segment.operations.items
    .filter(
      (operation: ASTViewOperation) =>
        operation instanceof ASTWhereViewOperation ||
        operation instanceof ASTHavingViewOperation
    )
    .map((op: ASTWhereViewOperation | ASTHavingViewOperation) => {
      // console.log('op');
      // console.dir(op, { depth: null });

      let astFilter: ASTFilter = op.filter;

      let parsedFilter: ParsedFilter = (
        astFilter as ASTFilterWithFilterString
      ).getFilter();

      parsedFilters.push(parsedFilter); // for logs

      // console.log('parsedFilter');
      // console.dir(parsedFilter, { depth: null });

      let exp = op.node.filter.expression as ExpressionWithFieldReference;

      let fieldId = common.isDefined(exp.path)
        ? [...exp.path, exp.name].join('.')
        : exp.name;

      let field = apiModel.fields.find(k => k.id === fieldId);

      let parentBrick = `f\`${(op.node.filter as FilterWithFilterString).filter}\``;

      let fractions: common.Fraction[] =
        field.result === common.FieldResultEnum.String &&
        parsedFilter.kind === 'string'
          ? getMalloyFilterStringFractions({
              parentBrick: parentBrick,
              parsed: parsedFilter.parsed
            })
          : field.result === common.FieldResultEnum.Boolean &&
              parsedFilter.kind === 'boolean'
            ? getMalloyFilterBooleanFractions({
                parentBrick: parentBrick,
                parsed: parsedFilter.parsed
              })
            : field.result === common.FieldResultEnum.Number &&
                parsedFilter.kind === 'number'
              ? getMalloyFilterNumberFractions({
                  parentBrick: parentBrick,
                  parsed: parsedFilter.parsed
                })
              : [
                    common.FieldResultEnum.Ts,
                    common.FieldResultEnum.Date
                  ].indexOf(field.result) > -1 &&
                  (parsedFilter.kind === 'timestamp' ||
                    parsedFilter.kind === 'date')
                ? getMalloyFilterTsFractions({
                    parentBrick: parentBrick,
                    parsed: parsedFilter.parsed,
                    isGetTimeRange: false
                    // timezone: timezone,
                    // weekStart: weekStart
                  }).fractions
                : [];

      if (common.isDefined(filtersFractions[fieldId])) {
        filtersFractions[fieldId] = [
          ...filtersFractions[fieldId],
          ...fractions
        ];
      } else {
        filtersFractions[fieldId] = [...fractions];
      }

      return op.filter;
    });

  // fse.writeFileSync(
  //   `filters-fractions.json`,
  //   JSON.stringify(filtersFractions, null, 2),
  //   'utf-8'
  // );

  // fse.writeFileSync(
  //   `parsed-filters.json`,
  //   JSON.stringify(parsedFilters, null, 2),
  //   'utf-8'
  // );

  // console.log('filtersFractions');
  // console.dir(filtersFractions, { depth: null });

  // Object.keys(filtersFractions).forEach(key => {
  //   filtersFractions[key].forEach(fraction => {
  //     if (fraction.brick !== fraction.parentBrick) {
  //       console.log(fraction.parentBrick);
  //       console.log(fraction.brick);
  //     }
  //   });
  // });

  return { filtersFractions: filtersFractions, parsedFilters: parsedFilters };
}
