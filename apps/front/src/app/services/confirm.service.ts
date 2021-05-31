import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ConfirmService {
  confirm(message: string) {
    return new Promise<boolean>(resolve => resolve(window.confirm(message)));
  }
}
