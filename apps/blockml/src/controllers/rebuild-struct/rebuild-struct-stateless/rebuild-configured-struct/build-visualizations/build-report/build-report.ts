import type { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import type { BmError } from '#blockml/classes/bm-error/bm-error';
import type { BlockmlConfig } from '#blockml/config/blockml-config';
import type { Caller } from '#common/types/blockml/diagnostics/caller';
import type { FilePartSpace } from '#common/types/blockml/parts/internal/file-part-space';
import type { FileReport } from '#common/types/blockml/parts/internal/file-report';
import type { FileStore } from '#common/types/blockml/parts/internal/file-store';
import type { Model } from '#common/types/blockml/parts/model/model';
import type { ModelMetric } from '#common/types/blockml/parts/model/model-metric';
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
  caller: Caller;
  cs: ConfigService<BlockmlConfig>;
}): Result.Result<FileReport[], never> {
  return Result.pipe(
    Result.succeed(item),
    Result.bind('checkedReports', v =>
      checkReport({
        reports: v.reports,
        structId: v.structId,
        errors: v.errors,
        caller: v.caller,
        cs: v.cs
      })
    ),
    Result.bind('accessCheckedReports', v =>
      checkReportAccess({
        reports: v.checkedReports,
        structId: v.structId,
        errors: v.errors,
        caller: v.caller,
        cs: v.cs
      })
    ),
    Result.bind('topParametersCheckedReports', v =>
      checkReportTopParameters({
        reports: v.accessCheckedReports,
        stores: v.stores,
        structId: v.structId,
        errors: v.errors,
        caller: v.caller,
        cs: v.cs
      })
    ),
    Result.bind('filterConditionsCheckedReports', v =>
      checkReportFilterConditions({
        reports: v.topParametersCheckedReports,
        structId: v.structId,
        caseSensitiveStringFilters: v.caseSensitiveStringFilters,
        errors: v.errors,
        caller: v.caller,
        cs: v.cs
      })
    ),
    Result.bind('rowUnknownParametersCheckedReports', v =>
      checkReportRowUnknownParameters({
        reports: v.filterConditionsCheckedReports,
        structId: v.structId,
        errors: v.errors,
        caller: v.caller,
        cs: v.cs
      })
    ),
    Result.bind('rowUnknownParamsCheckedReports', v =>
      checkReportRowUnknownParams({
        reports: v.rowUnknownParametersCheckedReports,
        structId: v.structId,
        errors: v.errors,
        caller: v.caller,
        cs: v.cs
      })
    ),
    Result.bind('rowCheckedReports', v =>
      checkReportRow({
        reports: v.rowUnknownParamsCheckedReports,
        metrics: v.metrics,
        structId: v.structId,
        errors: v.errors,
        caller: v.caller,
        cs: v.cs
      })
    ),
    Result.bind('rowIdsCheckedReports', v =>
      checkReportRowIds({
        reports: v.rowCheckedReports,
        structId: v.structId,
        errors: v.errors,
        caller: v.caller,
        cs: v.cs
      })
    ),
    Result.bind('rowParametersCheckedReports', v =>
      checkReportRowParameters({
        reports: v.rowIdsCheckedReports,
        metrics: v.metrics,
        apiModels: v.apiModels,
        stores: v.stores,
        structId: v.structId,
        caseSensitiveStringFilters: v.caseSensitiveStringFilters,
        errors: v.errors,
        caller: v.caller,
        cs: v.cs
      })
    ),
    Result.bind('rowParameterFractionsBuiltReports', v =>
      buildReportRowParameterFractions({
        reports: v.rowParametersCheckedReports,
        metrics: v.metrics,
        structId: v.structId,
        caseSensitiveStringFilters: v.caseSensitiveStringFilters,
        errors: v.errors,
        caller: v.caller,
        cs: v.cs
      })
    ),
    Result.andThen(v =>
      makeReportAccessRolesCombined({
        reports: v.rowParameterFractionsBuiltReports,
        spaces: v.spaces,
        structId: v.structId,
        errors: v.errors,
        caller: v.caller,
        cs: v.cs
      })
    )
  );
}
