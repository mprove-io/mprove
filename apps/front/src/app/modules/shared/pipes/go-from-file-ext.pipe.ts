import { Pipe, PipeTransform } from '@angular/core';
import { common } from '~front/barrels/common';

@Pipe({ name: 'goFromFileExt' })
export class GoFromFileExtPipe implements PipeTransform {
  transform(value: string) {
    if (common.isUndefined(value)) {
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
