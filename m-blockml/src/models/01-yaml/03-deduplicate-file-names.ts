import { interfaces } from '../../barrels/interfaces';
import { enums } from '../../barrels/enums';
import { helper } from '../../barrels/helper';
import { BmError } from '../bm-error';
import { ConfigService } from '@nestjs/config';

let func = enums.FuncEnum.DeduplicateFileNames;

export function deduplicateFileNames(
  item: {
    file2s: interfaces.File2[];
    errors: BmError[];
    structId: string;
    caller: enums.CallerEnum;
  },
  cs: ConfigService
): interfaces.File3[] {
  let { caller, structId } = item;
  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Input, item);

  let file3s: interfaces.File3[] = [];

  item.file2s.forEach((x: interfaces.File2) => {
    if (x.pathContents.length > 1) {
      let lines: interfaces.BmErrorLine[] = x.pathContents.map(fp => ({
        line: 0,
        name: x.name,
        path: fp.path
      }));

      item.errors.push(
        new BmError({
          title: enums.ErTitleEnum.DUPLICATE_FILE_NAMES,
          message:
            'BlockML file names should be unique across all folders. ' +
            `Found duplicate ${x.name} files`,
          lines: lines
        })
      );
    } else {
      file3s.push({
        name: x.name,
        ext: x.ext,
        path: x.pathContents[0].path,
        content: x.pathContents[0].content
      });
    }
  });

  helper.log(cs, caller, func, structId, enums.LogTypeEnum.File3s, file3s);
  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Errors, item.errors);

  return file3s;
}
