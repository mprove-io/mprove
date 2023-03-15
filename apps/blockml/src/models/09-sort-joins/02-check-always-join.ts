import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';

let func = common.FuncEnum.CheckAlwaysJoin;

export function checkAlwaysJoin(
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

    x.alwaysJoinUnique = {};

    if (common.isUndefined(x.always_join)) {
      newModels.push(x);
      return;
    }

    let joinList = x.always_join.split(',');

    joinList.forEach(asPart => {
      let reg = common.MyRegex.CAPTURE_WORD_BETWEEN_WHITESPACES();
      let r;

      if ((r = reg.exec(asPart))) {
        let asName = r[1];

        let join = x.joins.find(j => j.as === asName);

        if (common.isUndefined(join)) {
          item.errors.push(
            new BmError({
              title: common.ErTitleEnum.ALWAYS_JOIN_REFS_MISSING_JOIN,
              message:
                `parameter "${common.ParameterEnum.AlwaysJoin}" references ` +
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
            title: common.ErTitleEnum.WRONG_ALWAYS_JOIN,
            message:
              `parameter "${common.ParameterEnum.AlwaysJoin}" must have one or more ` +
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
