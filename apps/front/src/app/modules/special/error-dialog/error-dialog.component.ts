import { CommonModule } from '@angular/common';
import {
  CUSTOM_ELEMENTS_SCHEMA,
  Component,
  HostListener,
  OnInit
} from '@angular/core';
import { DialogRef } from '@ngneat/dialog';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { APP_SPINNER_NAME } from '~common/constants/top-front';
import { isDefined } from '~common/functions/is-defined';

import { ErrorData } from '~common/interfaces/front/error-data';

@Component({
  selector: 'm-error-dialog',
  templateUrl: './error-dialog.component.html',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, NgxSpinnerModule]
})
export class ErrorDialogComponent implements OnInit {
  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.ref.close();
  }

  originalErrorMessage: string;
  message: string;
  description: string;
  leftButtonText: string;
  rightButtonText: string;
  path: string;
  traceId: string;

  constructor(
    public ref: DialogRef<ErrorData>,
    private spinner: NgxSpinnerService
  ) {}

  ngOnInit() {
    this.spinner.hide(APP_SPINNER_NAME);

    if (this.ref.data?.skipLogToConsole !== true) {
      console.log(this.ref.data);

      let stack = this.ref.data?.originalError?.stack;
      if (isDefined(stack)) {
        console.log(stack);
      }
    }

    this.description = this.ref.data.description;
    this.leftButtonText = this.ref.data.leftButtonText;
    this.rightButtonText = this.ref.data.rightButtonText;

    this.message =
      this.ref.data?.response?.body?.info?.error?.message ||
      this.ref.data?.message ||
      this.ref.data;

    this.originalErrorMessage =
      this.ref.data?.response?.body?.info?.error?.originalError?.message;

    this.path = this.ref.data?.reqBody?.info?.name;
    this.traceId = this.ref.data?.reqBody?.info?.traceId;

    setTimeout(() => {
      (document.activeElement as HTMLElement).blur();
    }, 0);
  }

  leftButtonClick() {
    if (isDefined(this.ref.data.leftOnClickFnBindThis)) {
      this.ref.data.leftOnClickFnBindThis();
    }
    this.ref.close();
  }

  rightButtonClick() {
    if (isDefined(this.ref.data.rightOnClickFnBindThis)) {
      this.ref.data.rightOnClickFnBindThis();
    }
    this.ref.close();
  }
}
