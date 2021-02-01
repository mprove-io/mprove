import { enums } from '~blockml/barrels/enums';
import { BmErrorLine } from '~blockml/interfaces/bm-error-line';

export class BmError {
  title: enums.ErTitleEnum;
  message: string;
  lines: BmErrorLine[];

  constructor(item: {
    title: enums.ErTitleEnum;
    message: string;
    lines: BmErrorLine[];
  }) {
    this.title = item.title;
    this.message = item.message;
    this.lines = item.lines;
  }
}
