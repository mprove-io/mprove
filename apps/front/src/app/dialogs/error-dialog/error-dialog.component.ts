import { Component } from '@angular/core';
import { DialogRef } from '@ngneat/dialog';
import { ClientError } from '~front/app/models/client-error';

@Component({
  selector: 'm-error-dialog',
  templateUrl: './error-dialog.component.html'
})
export class ErrorDialogComponent {
  constructor(public ref: DialogRef<ClientError>) {}

  onOk() {
    this.ref.close();
  }
}
