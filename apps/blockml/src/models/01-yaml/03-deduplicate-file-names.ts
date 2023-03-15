import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';

let func = common.FuncEnum.DeduplicateFileNames;

export function deduplicateFileNames(
  item: {
    file2s: common.File2[];
    errors: BmError[];
    structId: string;
    caller: common.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
): common.File3[] {
  let { caller, structId } = item;
  helper.log(cs, caller, func, structId, common.LogTypeEnum.Input, item);

  let file3s: common.File3[] = [];

  item.file2s.forEach((x: common.File2) => {
    if (x.pathContents.length > 1) {
      let lines: common.BmErrorLine[] = x.pathContents.map(fp => ({
        line: 0,
        name: x.name,
        path: fp.path
      }));

      item.errors.push(
        new BmError({
          title: common.ErTitleEnum.DUPLICATE_FILE_NAMES,
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

  helper.log(cs, caller, func, structId, common.LogTypeEnum.File3s, file3s);
  helper.log(
    cs,
    caller,
    func,
    structId,
    common.LogTypeEnum.Errors,
    item.errors
  );

  return file3s;
}
