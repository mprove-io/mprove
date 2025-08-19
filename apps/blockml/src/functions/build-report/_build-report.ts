import { ConfigService } from '@nestjs/config';
import { barReport } from '~blockml/barrels/bar-report';
import { BmError } from '~blockml/models/bm-error';

export function buildReport(
  item: {
    reports: FileReport[];
    metrics: ModelMetric[];
    apiModels: Model[];
    stores: FileStore[];
    errors: BmError[];
    structId: string;
    caseSensitiveStringFilters: boolean;
    caller: CallerEnum;
  },
  cs: ConfigService<BlockmlConfig>
) {
  let reports = item.reports;

  reports = barReport.checkReport(
    {
      reports: reports,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  reports = barReport.checkReportAccess(
    {
      reports: reports,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  reports = barReport.checkReportTopParameters(
    {
      reports: reports,
      stores: item.stores,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  reports = barReport.checkReportFilterConditions(
    {
      reports: reports,
      structId: item.structId,
      caseSensitiveStringFilters: item.caseSensitiveStringFilters,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  reports = barReport.checkReportRowUnknownParameters(
    {
      reports: reports,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  reports = barReport.checkReportRowUnknownParams(
    {
      reports: reports,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  reports = barReport.checkReportRow(
    {
      reports: reports,
      metrics: item.metrics,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  reports = barReport.checkReportRowIds(
    {
      reports: reports,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  reports = barReport.checkReportRowParameters(
    {
      reports: reports,
      metrics: item.metrics,
      apiModels: item.apiModels,
      stores: item.stores,
      structId: item.structId,
      caseSensitiveStringFilters: item.caseSensitiveStringFilters,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  reports = barReport.buildReportRowParameterFractions(
    {
      reports: reports,
      metrics: item.metrics,
      structId: item.structId,
      caseSensitiveStringFilters: item.caseSensitiveStringFilters,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  return reports;
}
