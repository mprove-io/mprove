import { Component, OnInit } from '@angular/core';
import { DialogRef } from '@ngneat/dialog';
import { common } from '~front/barrels/common';
import { interfaces } from '~front/barrels/interfaces';

@Component({
  selector: 'm-error-dialog',
  templateUrl: './error-dialog.component.html'
})
export class ErrorDialogComponent implements OnInit {
  constructor(public ref: DialogRef<interfaces.ErrorData>) {}

  ngOnInit() {
    if (this.ref.data?.skipLogToConsole !== true) {
      console.log(this.ref.data);

      let stack = this.ref.data?.originalError?.stack;
      if (common.isDefined(stack)) {
        console.log(stack);
      }
    }
  }

  onOk() {
    this.ref.close();
  }
}
