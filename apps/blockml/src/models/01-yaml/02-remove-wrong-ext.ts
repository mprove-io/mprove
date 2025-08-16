import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';

let func = common.FuncEnum.RemoveWrongExt;

export function removeWrongExt(
  item: {
    files: common.BmlFile[];
    errors: BmError[];
    structId: string;
    caller: common.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
): common.File2[] {
  let { caller, structId } = item;
  helper.log(cs, caller, func, structId, common.LogTypeEnum.Input, item);

  let file2s: common.File2[] = [];

  item.files.forEach((x: common.BmlFile) => {
    let fp = {
      path: x.path,
      content: x.content
    };

    let reg = common.MyRegex.CAPTURE_EXT();
    let r = reg.exec(x.name.toLowerCase());

    let ext: any = r ? r[1] : ''; // any

    if (
      [
        common.FileExtensionEnum.Store,
        common.FileExtensionEnum.Report,
        common.FileExtensionEnum.Dashboard,
        common.FileExtensionEnum.Chart,
        common.FileExtensionEnum.Md,
        common.FileExtensionEnum.Yml
      ].indexOf(ext) > -1
    ) {
      let f: common.File2 = file2s.find(y => y.name === x.name);

      if (f) {
        f.pathContents.push(fp);
      } else {
        file2s.push({
          name: x.name,
          pathContents: [fp],
          ext: ext
        });
      }
    } else {
      // do nothing
    }
  });

  helper.log(cs, caller, func, structId, common.LogTypeEnum.File2s, file2s);
  helper.log(
    cs,
    caller,
    func,
    structId,
    common.LogTypeEnum.Errors,
    item.errors
  );

  return file2s;
}
