import { ConfigService } from '@nestjs/config';
import { enums } from '~/barrels/enums';
import { helper } from '~/barrels/helper';
import { types } from '~/barrels/types';
import { BmError } from '~/models/bm-error';

let func = enums.FuncEnum.CheckMdzAccess;

export function checkMdzAccess<T extends types.mdzType>(
  item: {
    entities: Array<T>;
    errors: BmError[];
    structId: string;
    caller: enums.CallerEnum;
  },
  cs: ConfigService
) {
  let { caller, structId } = item;
  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Input, item);

  let newEntities: T[] = [];

  item.entities.forEach(x => {
    let errorsOnStart = item.errors.length;

    if (helper.isDefined(x.access_users)) {
      x.access_users.forEach(u => {
        if (typeof u !== 'string' && !(<any>u instanceof String)) {
          item.errors.push(
            new BmError({
              title: enums.ErTitleEnum.WRONG_ACCESS_USERS_ELEMENT,
              message: 'found array element that is not a single value',
              lines: [
                {
                  line: x.access_users_line_num,
                  name: x.fileName,
                  path: x.filePath
                }
              ]
            })
          );
          return;
        }
      });
    }

    if (helper.isDefined(x.access_roles)) {
      x.access_roles.forEach(u => {
        if (typeof u !== 'string' && !(<any>u instanceof String)) {
          item.errors.push(
            new BmError({
              title: enums.ErTitleEnum.WRONG_ACCESS_ROLES_ELEMENT,
              message: 'found array element that is not a single value',
              lines: [
                {
                  line: x.access_roles_line_num,
                  name: x.fileName,
                  path: x.filePath
                }
              ]
            })
          );
          return;
        }
      });
    }

    if (errorsOnStart === item.errors.length) {
      newEntities.push(x);
    }
  });

  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Errors, item.errors);
  helper.log(
    cs,
    caller,
    func,
    structId,
    enums.LogTypeEnum.Entities,
    newEntities
  );

  return newEntities;
}
