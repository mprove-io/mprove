import { Pipe, PipeTransform } from '@angular/core';
import { common } from '~front/barrels/common';

@Pipe({ name: 'hideColumns' })
// eslint-disable-next-line @angular-eslint/use-pipe-transform-interface
export class HideColumnsPipe implements PipeTransform {
  transform(sFields: common.MconfigField[], hColumns: string[]) {
    return hColumns ? sFields.filter(f => hColumns.indexOf(f.id) < 0) : sFields;
  }
}
