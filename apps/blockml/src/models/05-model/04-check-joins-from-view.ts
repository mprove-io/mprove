import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { enums } from '~blockml/barrels/enums';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';

let func = enums.FuncEnum.CheckJoinsFromView;

export function checkJoinsFromView(
  item: {
    models: interfaces.Model[];
    errors: BmError[];
    structId: string;
    caller: enums.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
) {
  let { caller, structId } = item;
  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Input, item);

  let newModels: interfaces.Model[] = [];

  item.models.forEach(x => {
    let errorsOnStart = item.errors.length;

    let froms: number[] = [];

    x.joins.forEach(j => {
      if (common.isDefined(j.from_view) && common.isDefined(j.join_view)) {
        item.errors.push(
          new BmError({
            title: enums.ErTitleEnum.FROM_VIEW_AND_JOIN_VIEW,
            message: `one Join can not contain both "${enums.ParameterEnum.FromView}" and "${enums.ParameterEnum.JoinView}" parameters at the same time`,
            lines: [
              {
                line: j.from_view_line_num,
                name: x.fileName,
                path: x.filePath
              },
              {
                line: j.join_view_line_num,
                name: x.fileName,
                path: x.filePath
              }
            ]
          })
        );
        return;
      }

      if (common.isUndefined(j.from_view) && common.isUndefined(j.join_view)) {
        let lineNums: number[] = [];
        Object.keys(j)
          .filter(p => p.match(common.MyRegex.ENDS_WITH_LINE_NUM()))
          .forEach(l => lineNums.push(j[l as keyof interfaces.Join] as number));

        item.errors.push(
          new BmError({
            title: enums.ErTitleEnum.MISSING_FROM_VIEW_OR_JOIN_VIEW,
            message: `join element must contain "${enums.ParameterEnum.FromView}" or "${enums.ParameterEnum.JoinView}" parameters`,
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

      if (common.isDefined(j.from_view)) {
        froms.push(j.from_view_line_num);
      }
    });

    if (errorsOnStart === item.errors.length) {
      if (froms.length === 0) {
        item.errors.push(
          new BmError({
            title: enums.ErTitleEnum.MISSING_FROM_VIEW_ELEMENT,
            message: `${common.FileExtensionEnum.Model} must have exactly one Join with "${enums.ParameterEnum.FromView}" parameter`,
            lines: [
              {
                line: x.joins_line_num,
                name: x.fileName,
                path: x.filePath
              }
            ]
          })
        );
        return;
      }

      if (froms.length > 1) {
        let lines: interfaces.BmErrorLine[] = froms.map(num => ({
          line: num,
          name: x.fileName,
          path: x.filePath
        }));

        item.errors.push(
          new BmError({
            title: enums.ErTitleEnum.TOO_MANY_FROM_VIEW,
            message: `${common.FileExtensionEnum.Model} must have only one Join with "${enums.ParameterEnum.FromView}" parameter`,
            lines: lines
          })
        );
        return;
      }
    }

    if (errorsOnStart === item.errors.length) {
      newModels.push(x);
    }
  });

  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Errors, item.errors);
  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Models, newModels);

  return newModels;
}
