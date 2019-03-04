import { AmError } from '../../barrels/am-error';
import { ApRegex } from '../../barrels/am-regex';
import { ErrorsCollector } from '../../barrels/errors-collector';
import { interfaces } from '../../barrels/interfaces';

const { forEach } = require('p-iteration');

export async function removeWrongExt(item: {
  files: interfaces.File[]
}): Promise<interfaces.File2[]> {

  let file2s: interfaces.File2[] = [];

  // item.files.forEach(x => {
  await forEach(item.files, async (x: interfaces.File) => {


    let reg = ApRegex.CAPTURE_EXT();
    let r = reg.exec(x.name.toLowerCase());

    let ext: any = r ? r[1] : ''; // any

    if (['.udf', '.view', '.model', '.dashboard', '.md'].indexOf(ext) > -1) {

      let f: interfaces.File2 = file2s.find(z => z.name === x.name);

      if (f) {
        f.filePaths.push(x.path);

      } else {
        file2s.push({
          name: x.name,
          filePaths: [x.path],
          ext: ext
        });
      }

    } else {
      // error e1
      ErrorsCollector.addError(new AmError({
        title: 'wrong file extension',
        message: 'valid BlockML file extensions are: .udf .view .model .dashboard .md',
        lines: [{
          line: 0,
          name: x.name,
          path: x.path,
        }]
      }));
    }
  });

  return file2s;
}
