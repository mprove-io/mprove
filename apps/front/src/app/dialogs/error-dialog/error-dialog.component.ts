import { Component, OnInit } from '@angular/core';
import { DialogRef } from '@ngneat/dialog';
import { interfaces } from '~front/barrels/interfaces';

@Component({
  selector: 'm-error-dialog',
  templateUrl: './error-dialog.component.html'
})
export class ErrorDialogComponent implements OnInit {
  constructor(public ref: DialogRef<interfaces.ErrorData>) {}

  ngOnInit() {
    console.log(this.ref.data);
  }

  onOk() {
    this.ref.close();
  }
}
