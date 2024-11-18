import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';

let func = common.FuncEnum.CheckJoinRelationship;

export function checkJoinRelationship(
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
        if (common.isUndefined(join.relationship)) {
          item.errors.push(
            new BmError({
              title: common.ErTitleEnum.JOIN_MISSING_RELATIONSHIP,
              message:
                `parameter "${common.ParameterEnum.Relationship}" is ` +
                `required for each "${common.ParameterEnum.JoinView}"`,
              lines: [
                {
                  line: join.join_view_line_num,
                  name: x.fileName,
                  path: x.filePath
                }
              ]
            })
          );
        } else if (
          common.JOIN_RELATIONSHIP_VALUES.indexOf(join.relationship) < 0
        ) {
          item.errors.push(
            new BmError({
              title: common.ErTitleEnum.JOIN_WRONG_RELATIONSHIP,
              message: `join "${common.ParameterEnum.Relationship}" value "${join.relationship}" is not valid`,
              lines: [
                {
                  line: join.relationship_line_num,
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
