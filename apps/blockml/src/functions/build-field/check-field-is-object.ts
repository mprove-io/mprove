import { ConfigService } from '@nestjs/config';
import { BmError } from '~blockml/models/bm-error';

let func = FuncEnum.CheckFieldIsObject;

export function checkFieldIsObject<T extends sdrType>(
  item: {
    entities: T[];
    errors: BmError[];
    structId: string;
    caller: CallerEnum;
  },
  cs: ConfigService<BlockmlConfig>
) {
  let { caller, structId } = item;
  log(cs, caller, func, structId, LogTypeEnum.Input, item);

  let newEntities: T[] = [];

  item.entities.forEach(x => {
    let errorsOnStart = item.errors.length;

    x.fields.forEach(field => {
      if (isDefined(field) && field.constructor !== Object) {
        item.errors.push(
          new BmError({
            title: ErTitleEnum.FIELD_IS_NOT_A_DICTIONARY,
            message: 'found at least one field that is not a dictionary',
            lines: [
              {
                line: x.fields_line_num,
                name: x.fileName,
                path: x.filePath
              }
            ]
          })
        );
        return;
      }
    });

    x.parameters.forEach(parameter => {
      if (isDefined(parameter) && parameter.constructor !== Object) {
        item.errors.push(
          new BmError({
            title: ErTitleEnum.PARAMETER_IS_NOT_A_DICTIONARY,
            message: 'found at least one parameter that is not a dictionary',
            lines: [
              {
                line: x.parameters_line_num,
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

  log(cs, caller, func, structId, LogTypeEnum.Errors, item.errors);
  log(cs, caller, func, structId, LogTypeEnum.Entities, newEntities);

  return newEntities;
}
