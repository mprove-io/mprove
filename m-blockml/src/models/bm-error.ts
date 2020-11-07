import { helper } from '../barrels/helper';
import { interfaces } from '../barrels/interfaces';
import { enums } from '../barrels/enums';
import { ErrorLine } from '../interfaces/error-line';

export class BmError implements interfaces.BmErrorC {
  id: string;
  title: enums.ErTitleEnum;
  message: string;
  lines: ErrorLine[];
  at?: string;

  constructor(item: {
    title: enums.ErTitleEnum;
    message: string;
    lines: ErrorLine[];
    at?: string;
  }) {
    this.id = helper.makeErrorId();
    this.title = item.title;
    this.message = item.message;
    this.lines = item.lines;
    if (item.at) {
      this.at = item.at;
    }
  }
}
