import { Component } from '@angular/core';
import { DialogRef } from '@ngneat/dialog';

@Component({
  selector: 'm-password-reset-sent-dialog',
  templateUrl: './password-reset-sent-dialog.component.html'
})
export class PasswordResetSentDialogComponent {
  constructor(public ref: DialogRef) {}

  onOk() {
    this.ref.close();
  }
}
