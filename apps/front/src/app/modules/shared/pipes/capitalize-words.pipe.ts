import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ standalone: false, name: 'capitalizeWords' })
export class CapitalizeWordsPipe implements PipeTransform {
  transform(value: string) {
    if (isDefined(value)) {
      let newValue = value
        .split(' ')
        .map(x => x.charAt(0).toUpperCase() + x.slice(1))
        .join(' ');

      return newValue;
    }
    return value;
  }
}
