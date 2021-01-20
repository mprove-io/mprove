import { helper } from '../../barrels/helper';
import { enums } from '../../barrels/enums';
import { BmError } from '../bm-error';
import { interfaces } from '../../barrels/interfaces';
import { ConfigService } from '@nestjs/config';

let func = enums.FuncEnum.CheckJoinType;

export function checkJoinType(
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

    x.joins
      .filter(j => j.as !== x.fromAs)
      .forEach(join => {
        if (helper.isUndefined(join.type)) {
          join.type = enums.JoinTypeEnum.LeftOuter;
          join.type_line_num = 0;
        } else if (
          [
            enums.JoinTypeEnum.Cross,
            enums.JoinTypeEnum.Full,
            enums.JoinTypeEnum.FullOuter,
            enums.JoinTypeEnum.Inner,
            enums.JoinTypeEnum.Left,
            enums.JoinTypeEnum.LeftOuter,
            enums.JoinTypeEnum.Right,
            enums.JoinTypeEnum.RightOuter
          ].indexOf(join.type) < 0
        ) {
          item.errors.push(
            new BmError({
              title: enums.ErTitleEnum.JOIN_WRONG_TYPE,
              message: `join "${enums.ParameterEnum.Type}" value "${join.type}" is not valid`,
              lines: [
                {
                  line: join.type_line_num,
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
