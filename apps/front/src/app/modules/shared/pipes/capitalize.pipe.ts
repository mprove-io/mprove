import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ standalone: false, name: 'capitalize' })
export class CapitalizePipe implements PipeTransform {
  transform(value: string) {
    if (isDefined(value)) {
      return value.charAt(0).toUpperCase() + value.slice(1);
    }
    return value;
  }
}
