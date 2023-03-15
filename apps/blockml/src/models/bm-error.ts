import { BmErrorLine } from '~blockml/interfaces/bm-error-line';

export class BmError {
  title: common.ErTitleEnum;
  message: string;
  lines: BmErrorLine[];

  constructor(item: {
    title: common.ErTitleEnum;
    message: string;
    lines: BmErrorLine[];
  }) {
    this.title = item.title;
    this.message = item.message;
    this.lines = item.lines;
  }
}
