import { forEachSeries } from 'p-iteration';

import { interfaces } from '../../../barrels/interfaces';
import { api } from '../../../barrels/api';
import { BmError } from '../../bm-error';
import { helper } from '../../../barrels/helper';

let logPath = 'src/models/1-yaml/2-remove-wrong-ext/';

export async function removeWrongExt(item: {
  files: api.File[];
  errors: BmError[];
}): Promise<interfaces.File2[]> {
  helper.logInputToFile(logPath, item);

  let file2s: interfaces.File2[] = [];

  await forEachSeries(item.files, async (x: api.File) => {
    let fp = {
      path: x.path,
      content: x.content
    };

    let reg = api.MyRegex.CAPTURE_EXT();
    let r = reg.exec(x.name.toLowerCase());

    let ext: any = r ? r[1] : ''; // any

    if (['.udf', '.view', '.model', '.dashboard', '.md'].indexOf(ext) > -1) {
      let f: interfaces.File2 = file2s.find(z => z.name === x.name);

      if (f) {
        f.filePaths.push(fp);
      } else {
        file2s.push({
          name: x.name,
          filePaths: [fp],
          ext: ext
        });
      }
    } else {
      // error e1
      item.errors.push(
        new BmError({
          title: 'wrong file extension',
          message:
            'valid BlockML file extensions are: .udf .view .model .dashboard .md',
          lines: [
            {
              line: 0,
              name: x.name,
              path: x.path
            }
          ]
        })
      );
    }
  });

  helper.logOutputToFile(logPath, file2s);

  return file2s;
}
