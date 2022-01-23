import { Pipe, PipeTransform } from '@angular/core';
import { common } from '~front/barrels/common';

@Pipe({ name: 'hideColumns' })
export class HideColumnsPipe implements PipeTransform {
  transform(sFields: common.MconfigField[], hColumns: string[]) {
    return hColumns ? sFields.filter(f => hColumns.indexOf(f.id) < 0) : sFields;
  }
}
