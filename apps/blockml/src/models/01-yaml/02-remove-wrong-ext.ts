import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { enums } from '~blockml/barrels/enums';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';

let func = enums.FuncEnum.RemoveWrongExt;

export function removeWrongExt(
  item: {
    files: common.BmlFile[];
    errors: BmError[];
    structId: string;
    caller: enums.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
): interfaces.File2[] {
  let { caller, structId } = item;
  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Input, item);

  let file2s: interfaces.File2[] = [];

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
        common.FileExtensionEnum.Api,
        common.FileExtensionEnum.Dashboard,
        common.FileExtensionEnum.Md,
        common.FileExtensionEnum.Metric,
        common.FileExtensionEnum.Model,
        common.FileExtensionEnum.Rep,
        common.FileExtensionEnum.Udf,
        common.FileExtensionEnum.View,
        common.FileExtensionEnum.Vis,
        common.FileExtensionEnum.Yml
      ].indexOf(ext) > -1
    ) {
      let f: interfaces.File2 = file2s.find(z => z.name === x.name);

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

  helper.log(cs, caller, func, structId, enums.LogTypeEnum.File2s, file2s);
  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Errors, item.errors);

  return file2s;
}
