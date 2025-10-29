import { ConfigService } from '@nestjs/config';
import { BlockmlConfig } from '~blockml/config/blockml-config';
import { BmError } from '~blockml/models/bm-error';
import { CallerEnum } from '~common/enums/special/caller.enum';
import { FuncEnum } from '~common/enums/special/func.enum';
import { LogTypeEnum } from '~common/enums/special/log-type.enum';
import { isDefined } from '~common/functions/is-defined';
import { Fraction } from '~common/interfaces/blockml/fraction';
import { FileReport } from '~common/interfaces/blockml/internal/file-report';
import { ModelMetric } from '~common/interfaces/blockml/model-metric';
import { bricksToFractions } from '~node-common/functions/bricks-to-fractions';
import { log } from '../extra/log';

let func = FuncEnum.BuildReportRowParameterFractions;

export function buildReportRowParameterFractions(
  item: {
    caseSensitiveStringFilters: boolean;
    reports: FileReport[];
    metrics: ModelMetric[];
    errors: BmError[];
    structId: string;
    caller: CallerEnum;
  },
  cs: ConfigService<BlockmlConfig>
) {
  let { caller, structId, metrics, caseSensitiveStringFilters } = item;
  log(cs, caller, func, structId, LogTypeEnum.Input, item);

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
              // caseSensitiveStringFilters: caseSensitiveStringFilters,
              filterBricks: bricks,
              result: rowParameter.notStoreApplyToResult,
              fractions: fractions,
              isGetTimeRange: false
              // timezone: timezone,
              // weekStart: weekStart,
              // timeSpec: timeSpec
              // fractions: fractions,
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

  log(cs, caller, func, structId, LogTypeEnum.Errors, item.errors);
  log(cs, caller, func, structId, LogTypeEnum.Entities, newReports);

  return newReports;
}
