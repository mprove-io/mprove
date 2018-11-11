import { Pipe, PipeTransform } from '@angular/core';
import * as api from 'src/app/api/_index';

@Pipe({ name: 'hideColumnsPipe' })

export class HideColumnsPipe implements PipeTransform {

  transform(sFields: api.ModelField[], hColumns: string[]) {

    return hColumns
      ? sFields.filter(f => hColumns.indexOf(f.id) < 0)
      : sFields;
  }
}
