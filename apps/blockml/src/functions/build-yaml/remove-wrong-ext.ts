import { ConfigService } from '@nestjs/config';
import { BlockmlConfig } from '#blockml/config/blockml-config';
import { BmError } from '#blockml/models/bm-error';
import { FileExtensionEnum } from '#common/enums/file-extension.enum';
import { CallerEnum } from '#common/enums/special/caller.enum';
import { FuncEnum } from '#common/enums/special/func.enum';
import { LogTypeEnum } from '#common/enums/special/log-type.enum';
import { BmlFile } from '#common/interfaces/blockml/bml-file';
import { File2 } from '#common/interfaces/blockml/internal/file-2';
import { MyRegex } from '#common/models/my-regex';
import { log } from '../extra/log';

let func = FuncEnum.RemoveWrongExt;

export function removeWrongExt(
  item: {
    files: BmlFile[];
    errors: BmError[];
    structId: string;
    caller: CallerEnum;
  },
  cs: ConfigService<BlockmlConfig>
): File2[] {
  let { caller, structId } = item;
  log(cs, caller, func, structId, LogTypeEnum.Input, item);

  let file2s: File2[] = [];

  item.files.forEach((x: BmlFile) => {
    let fp = {
      path: x.path,
      content: x.content
    };

    let reg = MyRegex.CAPTURE_EXT();
    let r = reg.exec(x.name.toLowerCase());

    let ext: any = r ? r[1] : ''; // any

    if (
      [
        FileExtensionEnum.Store,
        FileExtensionEnum.Report,
        FileExtensionEnum.Dashboard,
        FileExtensionEnum.Chart,
        FileExtensionEnum.Md,
        FileExtensionEnum.Yml
      ].indexOf(ext) > -1
    ) {
      let f: File2 = file2s.find(y => y.name === x.name);

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

  log(cs, caller, func, structId, LogTypeEnum.File2s, file2s);
  log(cs, caller, func, structId, LogTypeEnum.Errors, item.errors);

  return file2s;
}
