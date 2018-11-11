import { Injectable } from '@angular/core';

@Injectable()
export class DataSizeService {

  getSize(totalSize: number) {

    let result: string;

    let kb = 1024;
    let mb = 1024 * 1024;
    let gb = 1024 * 1024 * 1024;
    let tb = 1024 * 1024 * 1024 * 1024;

    if (totalSize > tb) {
      let newSize = +((totalSize / tb).toFixed(2));
      result = `${newSize} tb`;

    } else if (totalSize > gb) {
      let newSize = +((totalSize / gb).toFixed(2));
      result = `${newSize} gb`;

    } else if (totalSize > mb) {
      let newSize = +((totalSize / mb).toFixed(2));
      result = `${newSize} mb`;

    } else if (totalSize > kb) {
      let newSize = +((totalSize / kb).toFixed(2));
      result = `${newSize} kb`;

    } else if (totalSize > -1) {
      result = `${totalSize} bytes`;

    } else if (totalSize === -1) {
      result = 'need PDTs';

    } else {
      result = null;
    }

    return result;
  }
}

