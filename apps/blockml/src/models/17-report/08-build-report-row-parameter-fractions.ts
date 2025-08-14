import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';
import { bricksToFractions } from '~node-common/functions/bricks-to-fractions';

let func = common.FuncEnum.BuildReportRowParameterFractions;

export function buildReportRowParameterFractions(
  item: {
    caseSensitiveStringFilters: boolean;
    reports: common.FileReport[];
    metrics: common.ModelMetric[];
    models: common.FileModel[];
    errors: BmError[];
    structId: string;
    caller: common.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
) {
  let { caller, structId, metrics, models, caseSensitiveStringFilters } = item;
  helper.log(cs, caller, func, structId, common.LogTypeEnum.Input, item);

  let newReports: common.FileReport[] = [];

  item.reports.forEach(x => {
    let errorsOnStart = item.errors.length;

    x.rows
      .filter(row => common.isDefined(row.parameters))
      .forEach(row => {
        row.parameters.forEach(rowParameter => {
          // console.log('rowParameter');
          // console.log(rowParameter);

          // console.log('rowParameter.listen');
          // console.log(rowParameter.listen);

          if (common.isDefined(rowParameter.conditions)) {
            let bricks = common.isDefined(rowParameter.listen)
              ? x.fields.find(
                  reportField => reportField.name === rowParameter.listen
                ).conditions
              : rowParameter.conditions;

            let fractions: common.Fraction[] = [];

            // let r = processFilter({
            //   caseSensitiveStringFilters: caseSensitiveStringFilters,
            //   filterBricks: bricks,
            //   result: rowParameter.notStoreApplyToResult,
            //   fractions: fractions,
            //   getTimeRange: false
            // });

            let r = bricksToFractions({
              // caseSensitiveStringFilters: caseSensitiveStringFilters,
              filterBricks: bricks,
              result: rowParameter.notStoreApplyToResult,
              fractions: fractions,
              getTimeRange: false
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
          // if (common.isDefined(rowParameter.listen)) {
          //   let reportField = (<common.FileReport>x).fields.find(
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

  helper.log(
    cs,
    caller,
    func,
    structId,
    common.LogTypeEnum.Errors,
    item.errors
  );
  helper.log(
    cs,
    caller,
    func,
    structId,
    common.LogTypeEnum.Entities,
    newReports
  );

  return newReports;
}
