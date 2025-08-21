import { Pipe, PipeTransform } from '@angular/core';
import { isUndefined } from '~common/functions/is-undefined';

@Pipe({ standalone: false, name: 'goFromFileExt' })
export class GoFromFileExtPipe implements PipeTransform {
  transform(value: string) {
    if (isUndefined(value)) {
      return value;
    }

    const valueChunks: string[] = value.split('.');

    let ext = '.other';

    if (valueChunks.length > 1) {
      ext = `.${valueChunks[valueChunks.length - 1]}`;
    }

    ext = ['.view', '.store'].indexOf(ext) > -1 ? '.model' : ext;

    return ext.substring(1);
  }
}
