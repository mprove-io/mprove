import { Pipe, PipeTransform } from '@angular/core';
import { interfaces } from '~front/barrels/interfaces';

@Pipe({ name: 'hideColumns' })
export class HideColumnsPipe implements PipeTransform {
  transform(sFields: interfaces.ColumnField[], hColumns: string[]) {
    return hColumns ? sFields.filter(f => hColumns.indexOf(f.id) < 0) : sFields;
  }
}
