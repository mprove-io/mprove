import { BmError } from '../bm-error';
import { api } from '../../barrels/api';

export function wrapErrors(item: {
  projectId: string;
  repoId: string;
  structId: string;
  errors: BmError[];
}): api.ErrorsPack {
  let errorsPackErrors: api.ErrorsPackError[] = item.errors.map(x => {
    let epError: api.ErrorsPackError = {
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
    return epError;
  });

  let errorsPack: api.ErrorsPack = {
    projectId: item.projectId,
    repoId: item.repoId,
    structId: item.structId,
    errors: errorsPackErrors,
    serverTs: 1
  };

  return errorsPack;
}
