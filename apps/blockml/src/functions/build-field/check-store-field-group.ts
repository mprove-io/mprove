import { ConfigService } from '@nestjs/config';
import { BmError } from '~blockml/models/bm-error';

let func = FuncEnum.CheckStoreFieldGroup;

export function checkStoreFieldGroup(
  item: {
    stores: FileStore[];
    errors: BmError[];
    structId: string;
    caller: CallerEnum;
  },
  cs: ConfigService<BlockmlConfig>
) {
  let { caller, structId } = item;
  log(cs, caller, func, structId, LogTypeEnum.Input, item);

  let newEntities: FileStore[] = [];

  item.stores.forEach(x => {
    let errorsOnStart = item.errors.length;

    x.fields
      .filter(field => field.fieldClass !== FieldClassEnum.Filter)
      .forEach(field => {
        if (isDefined(field.group) && isDefined(field.time_group)) {
          item.errors.push(
            new BmError({
              title: ErTitleEnum.STORE_FIELD_MULTIPLE_GROUPS,
              message: `store field can have only one of the parameters ${ParameterEnum.Group} or ${ParameterEnum.TimeGroup}`,
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
          isDefined(field.group) &&
          (x as FileStore).field_groups.map(r => r.group).indexOf(field.group) <
            0
        ) {
          item.errors.push(
            new BmError({
              title: ErTitleEnum.WRONG_STORE_FIELD_GROUP,
              message: `field ${field.group} must be one of store ${ParameterEnum.FieldGroups}`,
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
          isDefined(field.time_group) &&
          (x as FileStore).field_time_groups
            .map(r => r.time)
            .indexOf(field.time_group) < 0
        ) {
          item.errors.push(
            new BmError({
              title: ErTitleEnum.WRONG_STORE_FIELD_TIME_GROUP,
              message: `field ${field.time_group} must be one of store ${ParameterEnum.FieldTimeGroups}`,
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
      });

    if (errorsOnStart === item.errors.length) {
      x.fields.forEach(field => {
        if (isUndefined(field.group)) {
          if (isDefined(field.time_group)) {
            let timeGroup = (x as FileStore).field_time_groups.find(
              tg => tg.time === field.time_group
            );
            field.group = isDefined(timeGroup.group) ? timeGroup.group : MF;
          } else {
            field.group = MF;
          }
        }

        if (isDefined(field.time_group)) {
          field.groupId = field.time_group;

          let timeGroup = x.field_time_groups.find(
            tg => tg.time === field.time_group
          );

          field.group_label =
            timeGroup.label ||
            MyRegex.replaceUnderscoresWithSpaces(timeGroup.time);
          //
          field.group = timeGroup.group;
        }
      });
    }

    if (errorsOnStart === item.errors.length) {
      newEntities.push(x);
    }
  });

  log(cs, caller, func, structId, LogTypeEnum.Errors, item.errors);
  log(cs, caller, func, structId, LogTypeEnum.Entities, newEntities);

  return newEntities;
}
