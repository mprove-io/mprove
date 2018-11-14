import { Injectable } from '@angular/core';

@Injectable()
export class CookieService {
  getCookie(name: string) {
    let result: RegExpExecArray = new RegExp(
      '(?:^|; )' + encodeURIComponent(name) + '=([^;]*)'
    ).exec(document.cookie);
    return result ? result[1] : null;
  }

  deleteCookie(name: string) {
    this.setCookie(name, '', -1);
  }

  setCookie(
    name: string,
    value: string,
    expireTime: number,
    path: string = ''
  ) {
    let date = new Date();
    date.setTime(date.getTime() + expireTime);

    let expires = '; expires=' + date.toUTCString();

    document.cookie = name + '=' + value + expires + '; path=' + path;
  }
}
