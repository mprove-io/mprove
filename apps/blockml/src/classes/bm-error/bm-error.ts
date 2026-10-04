import type { ErTitle } from '#common/types/blockml/diagnostics/er-title';

import type { FileErrorLine } from '#common/types/blockml/parts/internal/file-error-line';
export class BmError {
  title: ErTitle;
  message: string;
  lines: FileErrorLine[];

  constructor(item: {
    title: ErTitle;
    message: string;
    lines: FileErrorLine[];
  }) {
    this.title = item.title;
    this.message = item.message;
    this.lines = item.lines;
  }
}
