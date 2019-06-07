import { AmError } from '../../barrels/am-error';
import { ErrorsCollector } from '../../barrels/errors-collector';
import { interfaces } from '../../barrels/interfaces';

import { forEachSeries } from 'p-iteration';

export async function deduplicateFileNames(item: {
  file2s: interfaces.File2[];
}): Promise<interfaces.File3[]> {
  let file3s: interfaces.File3[] = [];

  await forEachSeries(item.file2s, async (x: interfaces.File2) => {
    if (x.filePaths.length > 1) {
      let lines: interfaces.ErrorLine[] = x.filePaths.map(fp => ({
        line: 0,
        name: x.name,
        path: fp.path
      }));

      // error e2
      ErrorsCollector.addError(
        new AmError({
          title: 'duplicate file names',
          message:
            `BlockML file names should be unique across all folders. ` +
            `Found duplicate ${x.name} files`,
          lines: lines
        })
      );
    } else {
      file3s.push({
        name: x.name,
        ext: x.ext,
        path: x.filePaths[0].path,
        content: x.filePaths[0].content
      });
    }
  });

  return file3s;
}
