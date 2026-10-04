import type { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import type { BmError } from '#blockml/classes/bm-error/bm-error';
import type { BlockmlConfig } from '#blockml/config/blockml-config';
import { log } from '#blockml/functions/log/log';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { Caller } from '#common/types/blockml/diagnostics/caller';
import type { Func } from '#common/types/blockml/diagnostics/func';
import type { Fraction } from '#common/types/blockml/parts/fraction/fraction';
import type { FileReport } from '#common/types/blockml/parts/internal/file-report';
import type { ModelMetric } from '#common/types/blockml/parts/model/model-metric';
import { bricksToFractions } from '#node-common/functions/bricks-to-fractions/bricks-to-fractions';

let func: Func = 'build-report/build-report-row-parameter-fractions';

export function buildReportRowParameterFractions(item: {
  caseSensitiveStringFilters: boolean;
  reports: FileReport[];
  metrics: ModelMetric[];
  errors: BmError[];
  structId: string;
  caller: Caller;
  cs: ConfigService<BlockmlConfig>;
}): Result.Result<FileReport[], never> {
  let { cs, ...input } = item;

  let { caller, structId, metrics, caseSensitiveStringFilters } = item;

  log(cs, caller, func, structId, 'input.log', input);

  let newReports: FileReport[] = [];

  item.reports.forEach(x => {
    let errorsOnStart = item.errors.length;

    x.rows
      .filter(row => isDefined(row.parameters))
      .forEach(row => {
        row.parameters.forEach(rowParameter => {
          if (isDefined(rowParameter.conditions)) {
            let bricks = isDefined(rowParameter.listen)
              ? x.fields.find(
                  reportField => reportField.name === rowParameter.listen
                ).conditions
              : rowParameter.conditions;

            let fractions: Fraction[] = [];

            let r = bricksToFractions({
              filterBricks: bricks,
              result: rowParameter.notStoreApplyToResult,
              fractions: fractions,
              isGetTimeRange: false
            });

            if (r.valid === 0) {
              // already checked in 07-check-report-row-parameters
            }

            rowParameter.apiFractions = fractions;
          }

          // same logic already applied on backend
          // if (isDefined(rowParameter.listen)) {
          //   let reportField = (<FileReport>x).fields.find(
          //     f => f.name === rowParameter.listen
          //   );

          //   rowParameter.fractions = reportField.apiFractions;
          // }
        });
      });

    if (errorsOnStart === item.errors.length) {
      newReports.push(x);
    }
  });

  log(cs, caller, func, structId, 'out_errors.log', item.errors);

  log(cs, caller, func, structId, 'out_entities.log', newReports);

  return Result.succeed(newReports);
}
