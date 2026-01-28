import { BmlError } from '#common/interfaces/blockml/bml-error';
import { DiskFileLine } from '#common/interfaces/disk/disk-file-line';
import { BmError } from '~blockml/models/bm-error';

export function wrapErrors(item: { errors: BmError[] }) {
  let { errors } = item;

  let bmlErrors: BmlError[] = errors.map(x => {
    let bmlError: BmlError = {
      title: x.title.toString(),
      message: x.message,
      lines: x.lines.map(eLine => {
        let line: DiskFileLine = {
          lineNumber: eLine.line,
          fileName: eLine.name,
          fileId: eLine.path
        };
        return line;
      })
    };
    return bmlError;
  });

  return bmlErrors;
}
