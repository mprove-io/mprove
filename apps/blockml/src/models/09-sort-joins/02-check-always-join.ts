import { ConfigService } from '@nestjs/config';
import { api } from '~blockml/barrels/api';
import { enums } from '~blockml/barrels/enums';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';

let func = enums.FuncEnum.CheckAlwaysJoin;

export function checkAlwaysJoin(
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

    x.alwaysJoinUnique = {};

    if (helper.isUndefined(x.always_join)) {
      newModels.push(x);
      return;
    }

    let joinList = x.always_join.split(',');

    joinList.forEach(asPart => {
      let reg = api.MyRegex.CAPTURE_WORD_BETWEEN_WHITESPACES();
      let r;

      if ((r = reg.exec(asPart))) {
        let asName = r[1];

        let join = x.joins.find(j => j.as === asName);

        if (helper.isUndefined(join)) {
          item.errors.push(
            new BmError({
              title: enums.ErTitleEnum.ALWAYS_JOIN_REFS_MISSING_JOIN,
              message:
                `parameter "${enums.ParameterEnum.AlwaysJoin}" references ` +
                `Join "${asName}" that is missing or not valid`,
              lines: [
                {
                  line: x.always_join_line_num,
                  name: x.fileName,
                  path: x.filePath
                }
              ]
            })
          );
          return;
        }

        // ok
        x.alwaysJoinUnique[asName] = 1;
      } else {
        item.errors.push(
          new BmError({
            title: enums.ErTitleEnum.WRONG_ALWAYS_JOIN,
            message:
              `parameter "${enums.ParameterEnum.AlwaysJoin}" must have one or more ` +
              `Join aliases separated by comma. Found unparsable string "${asPart}".`,
            lines: [
              {
                line: x.always_join_line_num,
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

  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Errors, item.errors);
  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Models, newModels);

  return newModels;
}
