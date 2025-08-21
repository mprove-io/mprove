import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ standalone: false, name: 'hideColumns' })
export class HideColumnsPipe implements PipeTransform {
  transform(sFields: MconfigField[], hColumns: string[]) {
    return hColumns ? sFields.filter(f => hColumns.indexOf(f.id) < 0) : sFields;
  }
}
