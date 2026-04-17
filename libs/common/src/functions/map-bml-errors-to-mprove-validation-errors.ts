import type { MproveValidationError } from '#common/zod/backend/state/mprove-validation-error';
import type { BmlError } from '#common/zod/blockml/bml-error';

export function mapBmlErrorsToMproveValidationErrors(item: {
  errors: BmlError[];
}): MproveValidationError[] {
  let { errors } = item;

  return errors.map(e => ({
    title: e.title,
    message: e.message,
    lines: e.lines.map(l => {
      let parts = l.fileId.split('/');
      parts.shift();

      return {
        filePath: parts.join('/'),
        fileName: l.fileName,
        lineNumber: l.lineNumber
      };
    })
  }));
}
