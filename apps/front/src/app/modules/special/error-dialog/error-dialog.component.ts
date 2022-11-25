import { Component, HostListener, OnInit } from '@angular/core';
import { DialogRef } from '@ngneat/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { common } from '~front/barrels/common';
import { constants } from '~front/barrels/constants';
import { interfaces } from '~front/barrels/interfaces';

@Component({
  selector: 'm-error-dialog',
  templateUrl: './error-dialog.component.html'
})
export class ErrorDialogComponent implements OnInit {
  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.ref.close();
  }

  originalErrorMessage: string;
  message: string;
  description: string;
  buttonText: string;
  path: string;
  traceId: string;

  constructor(
    public ref: DialogRef<interfaces.ErrorData>,
    private spinner: NgxSpinnerService
  ) {}

  ngOnInit() {
    this.spinner.hide(constants.APP_SPINNER_NAME);

    if (this.ref.data?.skipLogToConsole !== true) {
      console.log(this.ref.data);

      let stack = this.ref.data?.originalError?.stack;
      if (common.isDefined(stack)) {
        console.log(stack);
      }
    }

    this.description = this.ref.data.description;
    this.buttonText = this.ref.data.buttonText;

    this.message = common.transformErrorMessage(
      this.ref.data?.response?.body?.info?.error?.message ||
        this.ref.data?.message ||
        this.ref.data
    );

    this.originalErrorMessage = common.transformErrorMessage(
      this.ref.data?.response?.body?.info?.error?.originalError?.message
    );

    this.path = this.ref.data?.reqBody?.info?.name;
    this.traceId = this.ref.data?.reqBody?.info?.traceId;

    setTimeout(() => {
      (document.activeElement as HTMLElement).blur();
    }, 0);
  }

  onOk() {
    if (common.isDefined(this.ref.data.onClickFnBindThis)) {
      this.ref.data.onClickFnBindThis();
    }
    this.ref.close();
  }
}
