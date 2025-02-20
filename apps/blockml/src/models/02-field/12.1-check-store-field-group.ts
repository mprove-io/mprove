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

    x.fields
      .filter(field => field.fieldClass !== common.FieldClassEnum.Filter)
      .forEach(field => {
        if (
          common.isDefined(field.group) &&
          common.isDefined(field.time_group)
        ) {
          item.errors.push(
            new BmError({
              title: common.ErTitleEnum.STORE_FIELD_MULTIPLE_GROUPS,
              message: `store field can have only one of the parameters ${common.ParameterEnum.Group} or ${common.ParameterEnum.TimeGroup}`,
              lines: [
                {
                  line: field.group_line_num,
                  name: x.fileName,
                  path: x.filePath
                },
                {
                  line: field.time_group_line_num,
                  name: x.fileName,
                  path: x.filePath
                }
              ]
            })
          );
          return;
        }

        if (
          common.isDefined(field.group) &&
          (x as common.FileStore).field_groups
            .map(r => r.group)
            .indexOf(field.group) < 0
        ) {
          item.errors.push(
            new BmError({
              title: common.ErTitleEnum.WRONG_STORE_FIELD_GROUP,
              message: `field ${field.group} must be one of store ${common.ParameterEnum.FieldGroups}`,
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

        if (
          common.isDefined(field.time_group) &&
          (x as common.FileStore).field_time_groups
            .map(r => r.time)
            .indexOf(field.time_group) < 0
        ) {
          item.errors.push(
            new BmError({
              title: common.ErTitleEnum.WRONG_STORE_FIELD_TIME_GROUP,
              message: `field ${field.time_group} must be one of store ${common.ParameterEnum.FieldTimeGroups}`,
              lines: [
                {
                  line: field.time_group_line_num,
                  name: x.fileName,
                  path: x.filePath
                }
              ]
            })
          );
          return;
        }

        if (common.isUndefined(field.group)) {
          if (common.isDefined(field.time_group)) {
            let timeGroup = (x as common.FileStore).field_time_groups.find(
              tg => tg.time === field.time_group
            );
            field.group = common.isDefined(timeGroup.group)
              ? timeGroup.group
              : common.MF;
          } else {
            field.group = common.MF;
          }
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
