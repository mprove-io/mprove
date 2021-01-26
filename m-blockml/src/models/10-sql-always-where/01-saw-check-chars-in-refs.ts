import { ConfigService } from '@nestjs/config';
import { api } from '~/barrels/api';
import { enums } from '~/barrels/enums';
import { helper } from '~/barrels/helper';
import { interfaces } from '~/barrels/interfaces';
import { BmError } from '~/models/bm-error';

let func = enums.FuncEnum.SawCheckCharsInRefs;

export function sawCheckCharsInRefs(
  item: {
    models: interfaces.Model[];
    errors: BmError[];
    structId: string;
    caller: enums.CallerEnum;
  },
  cs: ConfigService
) {
  let { caller, structId } = item;
  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Input, item);

  let newModels: interfaces.Model[] = [];

  item.models.forEach(x => {
    let errorsOnStart = item.errors.length;

    if (helper.isUndefined(x.sql_always_where)) {
      newModels.push(x);
      return;
    }

    let reg = api.MyRegex.CAPTURE_REFS_G();
    let r;
    let captures: string[] = [];

    while ((r = reg.exec(x.sql_always_where))) {
      captures.push(r[1]);
    }

    let wrongChars: string[] = [];

    captures.forEach(cap => {
      let reg2 = api.MyRegex.CAPTURE_NOT_ALLOWED_MODEL_REF_CHARS_G();
      let r2;

      while ((r2 = reg2.exec(cap))) {
        wrongChars.push(r2[1]);
      }
    });

    let wrongCharsString = '';

    wrongCharsString = [...new Set(wrongChars)].join(', ');

    if (wrongChars.length > 0) {
      item.errors.push(
        new BmError({
          title: enums.ErTitleEnum.WRONG_CHARS_IN_SQL_ALWAYS_WHERE_REFS,
          message:
            `characters "${wrongCharsString}" can not be used ` +
            `inside \$\{\} of ${api.FileExtensionEnum.Model}`,
          lines: [
            {
              line: x.sql_always_where_line_num,
              name: x.fileName,
              path: x.filePath
            }
          ]
        })
      );
      return;
    }

    if (errorsOnStart === item.errors.length) {
      newModels.push(x);
    }
  });

  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Errors, item.errors);
  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Models, newModels);

  return newModels;
}
