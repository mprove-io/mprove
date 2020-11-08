import { interfaces } from '../../barrels/interfaces';
import { enums } from '../../barrels/enums';
import { helper } from '../../barrels/helper';
import { forEachSeries } from 'p-iteration';
import { BmError } from '../bm-error';

let logPack = '1-yaml';
let logFolder = '3-deduplicate-file-names';

export async function deduplicateFileNames(item: {
  file2s: interfaces.File2[];
  errors: BmError[];
  structId: string;
}): Promise<interfaces.File3[]> {
  let logId = item.structId;
  helper.log(logId, logPack, logFolder, enums.LogEnum.In, item);

  let file3s: interfaces.File3[] = [];

  await forEachSeries(item.file2s, async (x: interfaces.File2) => {
    if (x.pathContents.length > 1) {
      let lines: interfaces.ErrorLine[] = x.pathContents.map(fp => ({
        line: 0,
        name: x.name,
        path: fp.path
      }));

      // error e2
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

  helper.log(logId, logPack, logFolder, enums.LogEnum.OutFile3s, file3s);
  helper.log(logId, logPack, logFolder, enums.LogEnum.OutErrors, item.errors);

  return file3s;
}
