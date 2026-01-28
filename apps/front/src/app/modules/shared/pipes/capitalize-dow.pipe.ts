import { Pipe, PipeTransform } from '@angular/core';
import { isDefined } from '#common/functions/is-defined';

@Pipe({ standalone: false, name: 'capitalizeDow' })
export class CapitalizeDowPipe implements PipeTransform {
  transform(value: string) {
    if (isDefined(value)) {
      let newValue = value
        .split(' ')
        .map(x => {
          if (
            [
              'monday',
              'tuesday',
              'wednesday',
              'thursday',
              'friday',
              'saturday',
              'sunday'
            ].indexOf(x) > -1
          ) {
            return x.charAt(0).toUpperCase() + x.slice(1);
          } else {
            return x;
          }
        })
        .join(' ');

      return newValue;
    }
    return value;
  }
}
