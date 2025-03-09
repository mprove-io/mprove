import { common } from '~backend/barrels/common';
import { schemaPostgres } from '~backend/barrels/schema-postgres';

export function makeReportFiltersX(report: schemaPostgres.ReportEnt) {
  let filtersX: common.FilterX[] = report.fields.map(field => {
    let filterX: common.FilterX = {
      fieldId: field.id,
      fractions: field.fractions.sort((a, b) => {
        let getPriority = (op: common.FractionOperatorEnum): number => {
          if (op === common.FractionOperatorEnum.Or) return 0;
          if (op === common.FractionOperatorEnum.And) return 1;
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
