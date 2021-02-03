import { ConfigService } from '@nestjs/config';
import { api } from '~blockml/barrels/api';
import { enums } from '~blockml/barrels/enums';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { types } from '~blockml/barrels/types';
import { BmError } from '~blockml/models/bm-error';

let func = enums.FuncEnum.CheckReportTitleModelSelect;

export function checkReportTitleModelSelect<T extends types.dzType>(
  item: {
    entities: Array<T>;
    models: interfaces.Model[];
    errors: BmError[];
    structId: string;
    caller: enums.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
) {
  let { caller, structId } = item;
  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Input, item);

  let newEntities: T[] = [];

  item.entities.forEach(x => {
    let errorsOnStart = item.errors.length;

    x.reports.forEach(report => {
      if (helper.isUndefined(report.title)) {
        let lineNums: number[] = [];

        Object.keys(report)
          .filter(p => p.match(api.MyRegex.ENDS_WITH_LINE_NUM()))
          .forEach(l => lineNums.push(report[l]));

        item.errors.push(
          new BmError({
            title: enums.ErTitleEnum.MISSING_REPORT_TITLE,
            message: `report must have ${enums.ParameterEnum.Title} parameter`,
            lines: [
              {
                line: Math.min(...lineNums),
                name: x.fileName,
                path: x.filePath
              }
            ]
          })
        );
        return;
      }

      if (helper.isUndefined(report.model)) {
        item.errors.push(
          new BmError({
            title: enums.ErTitleEnum.MISSING_REPORT_MODEL,
            message: `report must have ${enums.ParameterEnum.Model} parameter`,
            lines: [
              {
                line: report.title_line_num,
                name: x.fileName,
                path: x.filePath
              }
            ]
          })
        );
        return;
      }

      let model = item.models.find(m => m.name === report.model);

      if (helper.isUndefined(model)) {
        item.errors.push(
          new BmError({
            title: enums.ErTitleEnum.WRONG_REPORT_MODEL,
            message: `model "${report.model}" is missing or not valid`,
            lines: [
              {
                line: report.model_line_num,
                name: x.fileName,
                path: x.filePath
              }
            ]
          })
        );
        return;
      }

      if (helper.isUndefined(report.select)) {
        item.errors.push(
          new BmError({
            title: enums.ErTitleEnum.MISSING_REPORT_SELECT,
            message: `report must have "${enums.ParameterEnum.Select}" parameter`,
            lines: [
              {
                line: report.title_line_num,
                name: x.fileName,
                path: x.filePath
              }
            ]
          })
        );
        return;
      }
    });

    if (errorsOnStart === item.errors.length) {
      newEntities.push(x);
    }
  });

  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Errors, item.errors);
  helper.log(
    cs,
    caller,
    func,
    structId,
    enums.LogTypeEnum.Entities,
    newEntities
  );

  return newEntities;
}
