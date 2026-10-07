import type { ReportTab } from '#backend/drizzle/postgres/schema/_tabs';
import type { FilterX } from '#common/types/backend/parts/filter/filter-x';
import type { FractionOperator } from '#common/types/blockml/parts/fraction/fraction-operator';

export function makeReportFiltersX(item: { report: ReportTab }) {
  let filtersX: FilterX[] = item.report.fields.map(field => {
    let filterX: FilterX = {
      fieldId: field.id,
      fractions: field.fractions.sort((a, b) => {
        let getPriority = (op: FractionOperator): number => {
          if (op === 'Or') return 0;
          if (op === 'And') return 1;
          return 2;
        };

        return getPriority(a.operator) - getPriority(b.operator);
      }),
      field: field as any
    };
    return filterX;
  });

  return filtersX;
}
