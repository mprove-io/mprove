import { BmError } from '../bm-error';
import { api } from '../../barrels/api';

export function wrapErrors(item: { errors: BmError[] }) {
  let { errors } = item;

  let bmlErrors: api.BmlError[] = errors.map(x => {
    let bmlError: api.BmlError = {
      title: x.title.toString(),
      message: x.message,
      lines: x.lines.map(eLine => {
        let line: api.DiskFileLine = {
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
