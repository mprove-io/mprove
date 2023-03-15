import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';

let func = common.FuncEnum.JswCheckCharsInRefs;

export function jswCheckCharsInRefs(
  item: {
    models: common.FileModel[];
    errors: BmError[];
    structId: string;
    caller: common.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
) {
  let { caller, structId } = item;
  helper.log(cs, caller, func, structId, common.LogTypeEnum.Input, item);

  let newModels: common.FileModel[] = [];

  item.models.forEach(x => {
    let errorsOnStart = item.errors.length;

    x.joins
      .filter(j => j.as !== x.fromAs)
      .forEach(join => {
        let reg = common.MyRegex.CAPTURE_REFS_G();
        let r;
        let captures: string[] = [];

        while ((r = reg.exec(join.sql_where))) {
          captures.push(r[1]);
        }

        let jswWrongChars: string[] = [];

        captures.forEach(cap => {
          let reg2 = common.MyRegex.CAPTURE_NOT_ALLOWED_MODEL_REF_CHARS_G();
          let r2;

          while ((r2 = reg2.exec(cap))) {
            jswWrongChars.push(r2[1]);
          }
        });

        let jswWrongCharsString = '';

        jswWrongCharsString = [...new Set(jswWrongChars)].join(', ');

        if (jswWrongChars.length > 0) {
          item.errors.push(
            new BmError({
              title: common.ErTitleEnum.JOIN_WRONG_CHARS_IN_SQL_WHERE_REFS,
              message:
                `characters "${jswWrongCharsString}" can not be used ` +
                `inside \$\{\} of ${common.FileExtensionEnum.Model} (only snake_case "a...z0...9_" is allowed)`,
              lines: [
                {
                  line: join.sql_where_line_num,
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
      newModels.push(x);
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
  helper.log(cs, caller, func, structId, common.LogTypeEnum.Models, newModels);

  return newModels;
}
