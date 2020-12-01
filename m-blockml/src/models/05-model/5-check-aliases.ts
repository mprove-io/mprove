import { helper } from '../../barrels/helper';
import { enums } from '../../barrels/enums';
import { api } from '../../barrels/api';
import { BmError } from '../bm-error';
import { interfaces } from '../../barrels/interfaces';

let func = enums.FuncEnum.CheckAliases;

export function checkAliases(item: {
  models: interfaces.Model[];
  errors: BmError[];
  structId: string;
  caller: enums.CallerEnum;
}) {
  let { caller, structId } = item;
  helper.log(caller, func, structId, enums.LogTypeEnum.Input, item);

  let newModels: interfaces.Model[] = [];

  item.models.forEach(x => {
    let errorsOnStart = item.errors.length;

    let aliases: { as: string; asLineNums: number[] }[] = [];

    x.joins.forEach(j => {
      if (helper.isUndefined(j.as)) {
        let lineNums: number[] = [];
        Object.keys(j)
          .filter(p => p.match(api.MyRegex.ENDS_WITH_LINE_NUM()))
          .forEach(l => lineNums.push(j[l]));

        item.errors.push(
          new BmError({
            title: enums.ErTitleEnum.MISSING_AS,
            message: `parameter "${enums.ParameterEnum.As}" required for each element of joins list`,
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

      let index = aliases.findIndex(alias => alias.as === j.as);

      if (index > -1) {
        aliases[index].asLineNums.push(j.as_line_num);
      } else {
        aliases.push({ as: j.as, asLineNums: [j.as_line_num] });
      }

      if (helper.isDefined(j.from_view)) {
        x.fromAs = j.as;
      }
    });

    if (errorsOnStart === item.errors.length) {
      aliases.forEach(alias => {
        if (alias.asLineNums.length > 1) {
          item.errors.push(
            new BmError({
              title: enums.ErTitleEnum.DUPLICATE_ALIASES,
              message: `"${enums.ParameterEnum.As}" value must be unique across joins elements`,
              lines: alias.asLineNums.map(l => ({
                line: l,
                name: x.fileName,
                path: x.filePath
              }))
            })
          );
          return;
        }
      });
    }

    if (errorsOnStart === item.errors.length) {
      newModels.push(x);
    }
  });

  helper.log(caller, func, structId, enums.LogTypeEnum.Errors, item.errors);
  helper.log(caller, func, structId, enums.LogTypeEnum.Models, newModels);

  return newModels;
}
