import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';
import { GLOBAL_ROW_ID } from '~common/_index';
import { processFilter } from '../special/process-filter';

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
    // let errorsOnStart = item.errors.length;

    x.rows
      .filter(
        row =>
          common.isDefined(row.parameters) &&
          row.row_id !== GLOBAL_ROW_ID &&
          row.isStore === false
      )
      .forEach(row => {
        row.parameters
          .filter(
            rowParameter =>
              common.isDefined(rowParameter.conditions) ||
              common.isDefined(rowParameter.listen)
          )
          .forEach(rowParameter => {
            // console.log('rowParameter');
            // console.log(rowParameter);

            // console.log('rowParameter.listen');
            // console.log(rowParameter.listen);

            let bricks = common.isDefined(rowParameter.listen)
              ? x.fields.find(
                  reportField => reportField.name === rowParameter.listen
                ).conditions
              : rowParameter.conditions;

            let fractions: common.Fraction[] = [];

            // console.log('bricks');
            // console.log(bricks);

            let p = processFilter({
              caseSensitiveStringFilters: caseSensitiveStringFilters,
              filterBricks: bricks,
              result: rowParameter.notStoreApplyToResult,
              fractions: fractions,
              getTimeRange: false
            });

            if (p.valid !== 1) {
              // TODO: add error
              let fractionAny: common.Fraction = {
                brick: 'any',
                operator: common.FractionOperatorEnum.Or,
                type: common.getFractionTypeForAny(
                  rowParameter.notStoreApplyToResult
                )
              };

              fractions = [fractionAny];
            }

            rowParameter.apiFractions = fractions;

            // console.log('rowParameter.apiFractions');
            // console.log(rowParameter.apiFractions);
          });
      });

    // if (errorsOnStart === item.errors.length) {
    newReports.push(x);
    // }
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
