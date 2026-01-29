import { ConfigService } from '@nestjs/config';
import { BlockmlConfig } from '#blockml/config/blockml-config';
import { BmError } from '#blockml/models/bm-error';
import { CallerEnum } from '#common/enums/special/caller.enum';
import { ErTitleEnum } from '#common/enums/special/er-title.enum';
import { FuncEnum } from '#common/enums/special/func.enum';
import { LogTypeEnum } from '#common/enums/special/log-type.enum';
import { FileErrorLine } from '#common/interfaces/blockml/internal/file-error-line';
import { sdrType } from '#common/types/sdr-type';
import { log } from '../extra/log';

let func = FuncEnum.CheckFieldNameDuplicates;

export function checkFieldNameDuplicates<T extends sdrType>(
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
        let lines: FileErrorLine[] = n.lineNumbers.map(y => ({
          line: y,
          name: x.fileName,
          path: x.filePath
        }));

        item.errors.push(
          new BmError({
            title: ErTitleEnum.DUPLICATE_FIELD_NAMES,
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

  log(cs, caller, func, structId, LogTypeEnum.Errors, item.errors);
  log(cs, caller, func, structId, LogTypeEnum.Entities, newEntities);

  return newEntities;
}
