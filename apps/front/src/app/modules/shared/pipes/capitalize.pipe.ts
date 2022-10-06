import { Pipe, PipeTransform } from '@angular/core';
import { common } from '~front/barrels/common';

@Pipe({ name: 'capitalize' })
// eslint-disable-next-line @angular-eslint/use-pipe-transform-interface
export class CapitalizePipe implements PipeTransform {
  transform(value: string) {
    if (common.isDefined(value)) {
      return value.charAt(0).toUpperCase() + value.slice(1);
    }
    return value;
  }
}
