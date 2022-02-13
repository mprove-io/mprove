import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { enums } from '~blockml/barrels/enums';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';

let func = enums.FuncEnum.CheckAliases;

export function checkAliases(
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

    let aliases: { as: string; asLineNums: number[] }[] = [];

    x.joins.forEach(j => {
      if (common.isUndefined(j.as)) {
        let lineNums: number[] = [];
        Object.keys(j)
          .filter(p => p.match(common.MyRegex.ENDS_WITH_LINE_NUM()))
          .forEach(l => lineNums.push(j[l as keyof interfaces.Join] as number));

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

      if (common.isDefined(j.from_view)) {
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

        //

        let aliasWrongChars: string[] = [];

        let reg2 = common.MyRegex.CAPTURE_NOT_ALLOWED_ALIAS_CHARS_G();
        let r2;

        while ((r2 = reg2.exec(alias.as))) {
          aliasWrongChars.push(r2[1]);
        }

        let aliasWrongCharsString = '';

        if (aliasWrongChars.length > 0) {
          aliasWrongCharsString = [...new Set(aliasWrongChars)].join(', '); // unique

          item.errors.push(
            new BmError({
              title: enums.ErTitleEnum.WRONG_CHARS_IN_ALIAS,
              message: `Characters "${aliasWrongCharsString}" can not be used for alias (only snake_case "a...z0...9_" is allowed)`,
              lines: [
                {
                  line: alias.asLineNums[0],
                  name: x.fileName,
                  path: x.filePath
                }
              ]
            })
          );
          return false;
        }

        //
      });
    }

    if (errorsOnStart === item.errors.length) {
      newModels.push(x);
    }
  });

  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Errors, item.errors);
  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Models, newModels);

  return newModels;
}
