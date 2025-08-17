import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { types } from '~blockml/barrels/types';
import { BmError } from '~blockml/models/bm-error';

let func = common.FuncEnum.CheckFieldNameDuplicates;

export function checkFieldNameDuplicates<T extends types.sdrType>(
  item: {
    entities: T[];
    errors: BmError[];
    structId: string;
    caller: common.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
) {
  let { caller, structId } = item;
  helper.log(cs, caller, func, structId, common.LogTypeEnum.Input, item);

  let newEntities: T[] = [];

  item.entities.forEach(x => {
    let errorsOnStart = item.errors.length;

    // prepare field names

    let fieldNames: Array<{ name: string; lineNumbers: number[] }> = [];

    x.fields.forEach(field => {
      let fName = fieldNames.find(element => element.name === field.name);

      if (fName) {
        fName.lineNumbers.push(field.name_line_num);
      } else {
        fieldNames.push({
          name: field.name,
          lineNumbers: [field.name_line_num]
        });
      }
    });

    // process field names

    fieldNames.forEach(n => {
      if (n.lineNumbers.length > 1) {
        let lines: common.FileErrorLine[] = n.lineNumbers.map(y => ({
          line: y,
          name: x.fileName,
          path: x.filePath
        }));

        item.errors.push(
          new BmError({
            title: common.ErTitleEnum.DUPLICATE_FIELD_NAMES,
            message: 'Fields must have unique names',
            lines: lines
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
