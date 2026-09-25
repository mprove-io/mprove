import type { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import type { BmError } from '#blockml/classes/bm-error/bm-error';
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
  return Result.pipe(
    Result.succeed(item),
    Result.bind(
      'checkedReports',
      (v): Result.Result<FileReport[], never> =>
        checkReport({
          reports: v.reports,
          structId: v.structId,
          errors: v.errors,
          caller: v.caller,
          cs: v.cs
        })
    ),
    Result.bind(
      'accessCheckedReports',
      (v): Result.Result<FileReport[], never> =>
        checkReportAccess({
          reports: v.checkedReports,
          structId: v.structId,
          errors: v.errors,
          caller: v.caller,
          cs: v.cs
        })
    ),
    Result.bind(
      'topParametersCheckedReports',
      (v): Result.Result<FileReport[], never> =>
        checkReportTopParameters({
          reports: v.accessCheckedReports,
          stores: v.stores,
          structId: v.structId,
          errors: v.errors,
          caller: v.caller,
          cs: v.cs
        })
    ),
    Result.bind(
      'filterConditionsCheckedReports',
      (v): Result.Result<FileReport[], never> =>
        checkReportFilterConditions({
          reports: v.topParametersCheckedReports,
          structId: v.structId,
          caseSensitiveStringFilters: v.caseSensitiveStringFilters,
          errors: v.errors,
          caller: v.caller,
          cs: v.cs
        })
    ),
    Result.bind(
      'rowUnknownParametersCheckedReports',
      (v): Result.Result<FileReport[], never> =>
        checkReportRowUnknownParameters({
          reports: v.filterConditionsCheckedReports,
          structId: v.structId,
          errors: v.errors,
          caller: v.caller,
          cs: v.cs
        })
    ),
    Result.bind(
      'rowUnknownParamsCheckedReports',
      (v): Result.Result<FileReport[], never> =>
        checkReportRowUnknownParams({
          reports: v.rowUnknownParametersCheckedReports,
          structId: v.structId,
          errors: v.errors,
          caller: v.caller,
          cs: v.cs
        })
    ),
    Result.bind(
      'rowCheckedReports',
      (v): Result.Result<FileReport[], never> =>
        checkReportRow({
          reports: v.rowUnknownParamsCheckedReports,
          metrics: v.metrics,
          structId: v.structId,
          errors: v.errors,
          caller: v.caller,
          cs: v.cs
        })
    ),
    Result.bind(
      'rowIdsCheckedReports',
      (v): Result.Result<FileReport[], never> =>
        checkReportRowIds({
          reports: v.rowCheckedReports,
          structId: v.structId,
          errors: v.errors,
          caller: v.caller,
          cs: v.cs
        })
    ),
    Result.bind(
      'rowParametersCheckedReports',
      (v): Result.Result<FileReport[], never> =>
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
    Result.bind(
      'rowParameterFractionsBuiltReports',
      (v): Result.Result<FileReport[], never> =>
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
    Result.andThen(
      (v): Result.Result<FileReport[], never> =>
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
