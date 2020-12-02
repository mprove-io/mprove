import { enums } from '../../barrels/enums';
import { api } from '../../barrels/api';
import { helper } from '../../barrels/helper';
import { BmError } from '../bm-error';
import { interfaces } from '../../barrels/interfaces';

let func = enums.FuncEnum.CheckReportTitleModelSelect;

export function checkReportTitleModelSelect(item: {
  dashboards: interfaces.Dashboard[];
  models: interfaces.Model[];
  errors: BmError[];
  structId: string;
  caller: enums.CallerEnum;
}) {
  let { caller, structId } = item;
  helper.log(caller, func, structId, enums.LogTypeEnum.Input, item);

  let newDashboards: interfaces.Dashboard[] = [];

  item.dashboards.forEach(x => {
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
        // error e83
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
        // error e84
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
        // error e85
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
      newDashboards.push(x);
    }
  });

  helper.log(caller, func, structId, enums.LogTypeEnum.Errors, item.errors);
  helper.log(caller, func, structId, enums.LogTypeEnum.Ds, newDashboards);

  return newDashboards;
}
