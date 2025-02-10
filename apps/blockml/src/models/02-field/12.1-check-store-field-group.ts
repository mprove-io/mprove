import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';

let func = common.FuncEnum.CheckStoreFieldGroup;

export function checkStoreFieldGroup(
  item: {
    stores: common.FileStore[];
    errors: BmError[];
    structId: string;
    caller: common.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
) {
  let { caller, structId } = item;
  helper.log(cs, caller, func, structId, common.LogTypeEnum.Input, item);

  let newEntities: common.FileStore[] = [];

  item.stores.forEach(x => {
    let errorsOnStart = item.errors.length;

    x.fields.forEach(field => {
      if (
        common.isUndefined(field.group) &&
        field.fieldClass !== common.FieldClassEnum.Filter
      ) {
        let fieldKeysLineNums: number[] = Object.keys(field)
          .filter(y => y.match(common.MyRegex.ENDS_WITH_LINE_NUM()))
          .map(y => field[y as keyof common.FieldAny] as number)
          .filter(ln => ln !== 0);

        item.errors.push(
          new BmError({
            title: common.ErTitleEnum.MISSING_STORE_FIELD_GROUP,
            message: `field "${field.group}" is requred`,
            lines: [
              {
                line: Math.min(...fieldKeysLineNums),
                name: x.fileName,
                path: x.filePath
              }
            ]
          })
        );
        return;
      }

      let groups = (x as common.FileStore).field_groups.map(r => r.group);

      if (
        common.isDefined(field.group) &&
        field.fieldClass !== common.FieldClassEnum.Filter &&
        groups.indexOf(field.group) < 0
      ) {
        item.errors.push(
          new BmError({
            title: common.ErTitleEnum.WRONG_STORE_FIELD_GROUP,
            message: `field ${field.group} must be one of store field_groups`,
            lines: [
              {
                line: field.group_line_num,
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
      newEntities.push(x);
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
  helper.log(
    cs,
    caller,
    func,
    structId,
    common.LogTypeEnum.Entities,
    newEntities
  );

  return newEntities;
}
