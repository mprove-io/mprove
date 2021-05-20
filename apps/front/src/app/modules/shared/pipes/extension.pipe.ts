import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'extension' })
export class ExtensionPipe implements PipeTransform {
  transform(value: string, short?: boolean) {
    const valueChunks: string[] = value.split('.');

    let ext = 'other'; // default
    let s = 't'; // default

    if (valueChunks.length === 2) {
      ext = valueChunks[1];

      switch (ext) {
        case 'view':
          s = 'v';
          break;

        case 'model':
          s = 'm';
          break;

        case 'dashboard':
          s = 'd';
          break;

        case 'viz':
          s = 'z';
          break;

        case 'udf':
          s = 'u';
          break;

        case 'config':
          s = 'c';
          break;

        case 'md':
          s = 't';
          break;
      }
    }

    return short === true ? s : ext;
  }
}
