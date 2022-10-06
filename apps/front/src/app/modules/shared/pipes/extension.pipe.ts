import { Pipe, PipeTransform } from '@angular/core';
import { getFileExtension } from '~front/app/functions/get-file-extension';

@Pipe({ name: 'extension' })
// eslint-disable-next-line @angular-eslint/use-pipe-transform-interface
export class ExtensionPipe implements PipeTransform {
  transform(value: string, short?: boolean) {
    return getFileExtension(value, short);
  }
}
