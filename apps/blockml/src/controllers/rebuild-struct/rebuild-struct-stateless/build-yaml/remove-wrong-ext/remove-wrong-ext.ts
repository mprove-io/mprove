import type { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import { BmError } from '#blockml/classes/bm-error';
import type { BlockmlConfig } from '#blockml/config/blockml-config';
import { log } from '#blockml/functions/extra/log';
import { MyRegex } from '#common/classes/my-regex';
import { FileExtensionEnum } from '#common/enums/file-extension.enum';
import type { CallerEnum } from '#common/enums/special/caller.enum';
import { FuncEnum } from '#common/enums/special/func.enum';
import { LogTypeEnum } from '#common/enums/special/log-type.enum';
import type { BmlFile } from '#common/zod/blockml/bml-file';
import type { File2 } from '#common/zod/blockml/internal/file-2';

let func = FuncEnum.RemoveWrongExt;

export function removeWrongExt(item: {
  files: BmlFile[];
  errors: BmError[];
  structId: string;
  caller: CallerEnum;
  cs: ConfigService<BlockmlConfig>;
}): Result.Result<File2[], never> {
  let { caller, structId, cs } = item;
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
        FileExtensionEnum.Schema,
        FileExtensionEnum.Report,
        FileExtensionEnum.Dashboard,
        FileExtensionEnum.Chart,
        FileExtensionEnum.Space,
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

  return Result.succeed(file2s);
}
