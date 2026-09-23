import type { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import type { BmError } from '#blockml/classes/bm-error';
import type { BlockmlConfig } from '#blockml/config/blockml-config';
import type { CallerEnum } from '#common/enums/special/caller.enum';
import type { FilePartSpace } from '#common/zod/blockml/internal/file-part-space';
import type { FileReport } from '#common/zod/blockml/internal/file-report';
import type { FileStore } from '#common/zod/blockml/internal/file-store';
import type { Model } from '#common/zod/blockml/model';
import type { ModelMetric } from '#common/zod/blockml/model-metric';
import { buildReportRowParameterFractions } from './build-report-row-parameter-fractions/build-report-row-parameter-fractions';
import { checkReport } from './check-report/check-report';
import { checkReportAccess } from './check-report-access/check-report-access';
import { checkReportFilterConditions } from './check-report-filter-conditions/check-report-filter-conditions';
import { checkReportRow } from './check-report-row/check-report-row';
import { checkReportRowIds } from './check-report-row-ids/check-report-row-ids';
import { checkReportRowParameters } from './check-report-row-parameters/check-report-row-parameters';
import { checkReportRowUnknownParameters } from './check-report-row-unknown-parameters/check-report-row-unknown-parameters';
import { checkReportRowUnknownParams } from './check-report-row-unknown-params/check-report-row-unknown-params';
import { checkReportTopParameters } from './check-report-top-parameters/check-report-top-parameters';
import { makeReportAccessRolesCombined } from './make-report-access-roles-combined/make-report-access-roles-combined';

export function buildReport(item: {
  reports: FileReport[];
  spaces: FilePartSpace[];
  metrics: ModelMetric[];
  apiModels: Model[];
  stores: FileStore[];
  errors: BmError[];
  structId: string;
  caseSensitiveStringFilters: boolean;
  caller: CallerEnum;
  cs: ConfigService<BlockmlConfig>;
}): Result.Result<FileReport[], never> {
  let {
    reports,
    spaces,
    metrics,
    apiModels,
    stores,
    errors,
    structId,
    caseSensitiveStringFilters,
    caller,
    cs
  } = item;

  reports = checkReport(
    {
      reports: reports,
      structId: structId,
      errors: errors,
      caller: caller
    },
    cs
  );

  reports = checkReportAccess(
    {
      reports: reports,
      structId: structId,
      errors: errors,
      caller: caller
    },
    cs
  );

  reports = checkReportTopParameters(
    {
      reports: reports,
      stores: stores,
      structId: structId,
      errors: errors,
      caller: caller
    },
    cs
  );

  reports = checkReportFilterConditions(
    {
      reports: reports,
      structId: structId,
      caseSensitiveStringFilters: caseSensitiveStringFilters,
      errors: errors,
      caller: caller
    },
    cs
  );

  reports = checkReportRowUnknownParameters(
    {
      reports: reports,
      structId: structId,
      errors: errors,
      caller: caller
    },
    cs
  );

  reports = checkReportRowUnknownParams(
    {
      reports: reports,
      structId: structId,
      errors: errors,
      caller: caller
    },
    cs
  );

  reports = checkReportRow(
    {
      reports: reports,
      metrics: metrics,
      structId: structId,
      errors: errors,
      caller: caller
    },
    cs
  );

  reports = checkReportRowIds(
    {
      reports: reports,
      structId: structId,
      errors: errors,
      caller: caller
    },
    cs
  );

  reports = checkReportRowParameters(
    {
      reports: reports,
      metrics: metrics,
      apiModels: apiModels,
      stores: stores,
      structId: structId,
      caseSensitiveStringFilters: caseSensitiveStringFilters,
      errors: errors,
      caller: caller
    },
    cs
  );

  reports = buildReportRowParameterFractions(
    {
      reports: reports,
      metrics: metrics,
      structId: structId,
      caseSensitiveStringFilters: caseSensitiveStringFilters,
      errors: errors,
      caller: caller
    },
    cs
  );

  reports = makeReportAccessRolesCombined(
    {
      reports: reports,
      spaces: spaces,
      structId: structId,
      errors: errors,
      caller: caller
    },
    cs
  );

  return Result.succeed(reports);
}
