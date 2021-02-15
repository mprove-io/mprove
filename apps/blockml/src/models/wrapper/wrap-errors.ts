import { common } from '~blockml/barrels/common';
import { BmError } from '~blockml/models/bm-error';

export function wrapErrors(item: { errors: BmError[] }) {
  let { errors } = item;

  let bmlErrors: common.BmlError[] = errors.map(x => {
    let bmlError: common.BmlError = {
      title: x.title.toString(),
      message: x.message,
      lines: x.lines.map(eLine => {
        let line: common.DiskFileLine = {
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
