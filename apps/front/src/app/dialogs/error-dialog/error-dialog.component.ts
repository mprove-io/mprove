import { Component } from '@angular/core';
import { DialogRef } from '@ngneat/dialog';

@Component({
  selector: 'm-error-dialog',
  templateUrl: './error-dialog.component.html'
})
export class ErrorDialogComponent {
  constructor(public ref: DialogRef) {}

  onOk() {
    this.ref.close();
  }
}
