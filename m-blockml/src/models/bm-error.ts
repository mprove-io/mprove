import { enums } from '../barrels/enums';
import { BmErrorCLine } from '../interfaces/bm-error-c-line';
import { BmErrorC } from '../interfaces/bm-error-c';
import { makeErrorId } from '../functions/make-error-id';

export class BmError implements BmErrorC {
  // id: string;
  title: enums.ErTitleEnum;
  message: string;
  lines: BmErrorCLine[];
  at?: string;

  constructor(item: {
    title: enums.ErTitleEnum;
    message: string;
    lines: BmErrorCLine[];
    at?: string;
  }) {
    // this.id = makeErrorId();
    this.title = item.title;
    this.message = item.message;
    this.lines = item.lines;
    if (item.at) {
      this.at = item.at;
    }
  }
}
