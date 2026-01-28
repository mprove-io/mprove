import { FractionOperatorEnum } from '#common/enums/fraction/fraction-operator.enum';
import { FilterX } from '#common/interfaces/backend/filter-x';
import { ReportTab } from '~backend/drizzle/postgres/schema/_tabs';

export function makeReportFiltersX(item: { report: ReportTab }) {
  let filtersX: FilterX[] = item.report.fields.map(field => {
    let filterX: FilterX = {
      fieldId: field.id,
      fractions: field.fractions.sort((a, b) => {
        let getPriority = (op: FractionOperatorEnum): number => {
          if (op === FractionOperatorEnum.Or) return 0;
          if (op === FractionOperatorEnum.And) return 1;
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
