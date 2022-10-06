import { Pipe, PipeTransform } from '@angular/core';
import { common } from '~front/barrels/common';

@Pipe({ name: 'capitalizeWords' })
// eslint-disable-next-line @angular-eslint/use-pipe-transform-interface
export class CapitalizeWordsPipe implements PipeTransform {
  transform(value: string) {
    if (common.isDefined(value)) {
      let newValue = value
        .split(' ')
        .map(x => x.charAt(0).toUpperCase() + x.slice(1))
        .join(' ');

      return newValue;
    }
    return value;
  }
}
