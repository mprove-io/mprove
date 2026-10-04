import type { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import { BmError } from '#blockml/classes/bm-error/bm-error';
import type { BlockmlConfig } from '#blockml/config/blockml-config';
import { log } from '#blockml/functions/log/log';
import { MyRegex } from '#common/classes/my-regex/my-regex';
import type { Caller } from '#common/types/blockml/diagnostics/caller';
import type { Func } from '#common/types/blockml/diagnostics/func';

import type { BmlFile } from '#common/types/blockml/parts/file/bml-file';
import type { File2 } from '#common/types/blockml/parts/internal/file/file-2';

let func: Func = 'build-yaml/remove-wrong-ext';

export function removeWrongExt(item: {
  files: BmlFile[];
  errors: BmError[];
  structId: string;
  caller: Caller;
  cs: ConfigService<BlockmlConfig>;
}): Result.Result<File2[], never> {
  let { caller, structId, cs } = item;
  log(cs, caller, func, structId, 'input.log', item);

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
        '.store',
        '.schema',
        '.report',
        '.dashboard',
        '.chart',
        '.space',
        '.md',
        '.yml'
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

  log(cs, caller, func, structId, 'out_file2s.log', file2s);
  log(cs, caller, func, structId, 'out_errors.log', item.errors);

  return Result.succeed(file2s);
}
