import { common } from '~blockml/barrels/common';

export class BmError {
  title: common.ErTitleEnum;
  message: string;
  lines: common.BmErrorLine[];

  constructor(item: {
    title: common.ErTitleEnum;
    message: string;
    lines: common.BmErrorLine[];
  }) {
    this.title = item.title;
    this.message = item.message;
    this.lines = item.lines;
  }
}
