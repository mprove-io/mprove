import { ConfigService } from '@nestjs/config';
import { BmError } from '~blockml/models/bm-error';
import { CallerEnum } from '~common/enums/special/caller.enum';
import { BlockmlConfig } from '~common/interfaces/blockml/blockml-config';
import { FileReport } from '~common/interfaces/blockml/internal/file-report';
import { FileStore } from '~common/interfaces/blockml/internal/file-store';
import { Model } from '~common/interfaces/blockml/model';
import { ModelMetric } from '~common/interfaces/blockml/model-metric';
import { buildReportRowParameterFractions } from './build-report-row-parameter-fractions';
import { checkReport } from './check-report';
import { checkReportAccess } from './check-report-access';
import { checkReportFilterConditions } from './check-report-filter-conditions';
import { checkReportRow } from './check-report-row';
import { checkReportRowIds } from './check-report-row-ids';
import { checkReportRowParameters } from './check-report-row-parameters';
import { checkReportRowUnknownParameters } from './check-report-row-unknown-parameters';
import { checkReportRowUnknownParams } from './check-report-row-unknown-params';
import { checkReportTopParameters } from './check-report-top-parameters';

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

  reports = checkReport(
    {
      reports: reports,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  reports = checkReportAccess(
    {
      reports: reports,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  reports = checkReportTopParameters(
    {
      reports: reports,
      stores: item.stores,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  reports = checkReportFilterConditions(
    {
      reports: reports,
      structId: item.structId,
      caseSensitiveStringFilters: item.caseSensitiveStringFilters,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  reports = checkReportRowUnknownParameters(
    {
      reports: reports,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  reports = checkReportRowUnknownParams(
    {
      reports: reports,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  reports = checkReportRow(
    {
      reports: reports,
      metrics: item.metrics,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  reports = checkReportRowIds(
    {
      reports: reports,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  reports = checkReportRowParameters(
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

  reports = buildReportRowParameterFractions(
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
