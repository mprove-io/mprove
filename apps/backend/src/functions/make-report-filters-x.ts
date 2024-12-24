import { common } from '~backend/barrels/common';
import { schemaPostgres } from '~backend/barrels/schema-postgres';

export function makeReportFiltersX(report: schemaPostgres.ReportEnt) {
  let filtersX: common.FilterX[] = report.fields.map(field => {
    let fractions = [
      ...field.fractions.filter(
        fraction => fraction.operator === common.FractionOperatorEnum.Or
      ),
      ...field.fractions.filter(
        fraction => fraction.operator === common.FractionOperatorEnum.And
      )
    ];

    let filterX: common.FilterX = {
      fieldId: field.id,
      fractions: fractions,
      field: field as any
    };
    return filterX;
  });

  return filtersX;
}
