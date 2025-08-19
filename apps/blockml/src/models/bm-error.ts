import { ErTitleEnum } from '~common/enums/special/er-title.enum';
import { FileErrorLine } from '~common/interfaces/blockml/internal/file-error-line';

export class BmError {
  title: ErTitleEnum;
  message: string;
  lines: FileErrorLine[];

  constructor(item: {
    title: ErTitleEnum;
    message: string;
    lines: FileErrorLine[];
  }) {
    this.title = item.title;
    this.message = item.message;
    this.lines = item.lines;
  }
}
