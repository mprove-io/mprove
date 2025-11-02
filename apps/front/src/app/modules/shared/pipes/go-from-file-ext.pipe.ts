import { Pipe, PipeTransform } from '@angular/core';
import { isUndefined } from '~common/functions/is-undefined';

@Pipe({ standalone: false, name: 'goFromFileExt' })
export class GoFromFileExtPipe implements PipeTransform {
  transform(value: string) {
    if (isUndefined(value)) {
      return value;
    }

    let ext;

    let valueChunks = value.split('.');

    if (valueChunks.length > 1) {
      ext = `${valueChunks[valueChunks.length - 1]}`;
    } else {
      ext = 'other';
    }

    return ext;
  }
}
