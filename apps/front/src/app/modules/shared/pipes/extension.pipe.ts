import { Pipe, PipeTransform } from '@angular/core';
import { getFileExtension } from '~front/app/functions/get-file-extension';

@Pipe({ name: 'extension' })
export class ExtensionPipe implements PipeTransform {
  transform(value: string, short?: boolean) {
    return getFileExtension(value, short);
  }
}
