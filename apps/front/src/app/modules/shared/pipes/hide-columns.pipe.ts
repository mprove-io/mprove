import { Pipe, PipeTransform } from '@angular/core';
import { ColumnField } from '~front/app/queries/mconfig.query';

@Pipe({ name: 'hideColumns' })
export class HideColumnsPipe implements PipeTransform {
  transform(sFields: ColumnField[], hColumns: string[]) {
    return hColumns ? sFields.filter(f => hColumns.indexOf(f.id) < 0) : sFields;
  }
}
