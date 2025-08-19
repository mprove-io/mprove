import { ConfigService } from '@nestjs/config';
import { BmError } from '~blockml/models/bm-error';

let func = FuncEnum.DeduplicateFileNames;

export function deduplicateFileNames(
  item: {
    file2s: File2[];
    errors: BmError[];
    structId: string;
    caller: CallerEnum;
  },
  cs: ConfigService<BlockmlConfig>
): File3[] {
  let { caller, structId } = item;
  log(cs, caller, func, structId, LogTypeEnum.Input, item);

  let file3s: File3[] = [];

  item.file2s.forEach((x: File2) => {
    if (x.pathContents.length > 1) {
      let lines: FileErrorLine[] = x.pathContents.map(fp => ({
        line: 0,
        name: x.name,
        path: fp.path
      }));

      item.errors.push(
        new BmError({
          title: ErTitleEnum.DUPLICATE_FILE_NAMES,
          message:
            'Mprove Files file names must be unique across all folders. ' +
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

  log(cs, caller, func, structId, LogTypeEnum.File3s, file3s);
  log(cs, caller, func, structId, LogTypeEnum.Errors, item.errors);

  return file3s;
}
