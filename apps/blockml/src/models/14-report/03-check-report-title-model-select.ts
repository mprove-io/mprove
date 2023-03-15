import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { types } from '~blockml/barrels/types';
import { BmError } from '~blockml/models/bm-error';

let func = common.FuncEnum.CheckReportTitleModelSelect;

export function checkReportTitleModelSelect<T extends types.dzType>(
  item: {
    entities: T[];
    models: common.FileModel[];
    errors: BmError[];
    structId: string;
    caller: common.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
) {
  let { caller, structId } = item;
  helper.log(cs, caller, func, structId, common.LogTypeEnum.Input, item);

  let newEntities: T[] = [];

  item.entities.forEach(x => {
    let errorsOnStart = item.errors.length;

    let titles: { [title: string]: number[] } = {};

    x.reports.forEach(report => {
      if (common.isUndefined(report.title)) {
        let lineNums: number[] = [];

        Object.keys(report)
          .filter(p => p.match(common.MyRegex.ENDS_WITH_LINE_NUM()))
          .forEach(l =>
            lineNums.push(report[l as keyof common.FilePartReport] as number)
          );

        item.errors.push(
          new BmError({
            title: common.ErTitleEnum.MISSING_REPORT_TITLE,
            message: `report must have ${common.ParameterEnum.Title} parameter`,
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
      } else if (common.isDefined(titles[report.title.toUpperCase()])) {
        titles[report.title.toUpperCase()].push(report.title_line_num);
      } else {
        titles[report.title.toUpperCase()] = [report.title_line_num];
      }

      if (common.isUndefined(report.model)) {
        item.errors.push(
          new BmError({
            title: common.ErTitleEnum.MISSING_REPORT_MODEL,
            message: `report must have ${common.ParameterEnum.Model} parameter`,
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

      if (common.isUndefined(model)) {
        item.errors.push(
          new BmError({
            title: common.ErTitleEnum.WRONG_REPORT_MODEL,
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

      if (common.isUndefined(report.select)) {
        item.errors.push(
          new BmError({
            title: common.ErTitleEnum.MISSING_REPORT_SELECT,
            message: `report must have "${common.ParameterEnum.Select}" parameter`,
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

    Object.keys(titles).forEach(title => {
      if (titles[title].length > 1) {
        let lines: common.FileErrorLine[] = titles[title].map(lineNum => ({
          line: lineNum,
          name: x.fileName,
          path: x.filePath
        }));

        item.errors.push(
          new BmError({
            title: common.ErTitleEnum.DUPLICATE_REPORT_TITLE,
            message:
              'Report titles must be unique for dashboard. ' +
              `Found duplicate "${title.toLocaleLowerCase()}" title`,
            lines: lines
          })
        );
      }
    });

    if (errorsOnStart === item.errors.length) {
      newEntities.push(x);
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
    newEntities
  );

  return newEntities;
}
