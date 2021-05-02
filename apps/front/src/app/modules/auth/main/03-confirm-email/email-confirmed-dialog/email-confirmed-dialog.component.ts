import { Component } from '@angular/core';
import { DialogRef } from '@ngneat/dialog';

@Component({
  selector: 'm-email-confirmed-dialog',
  templateUrl: './email-confirmed-dialog.component.html'
})
export class EmailConfirmedDialogComponent {
  constructor(public ref: DialogRef) {}

  onOk() {
    this.ref.close();
  }
}
