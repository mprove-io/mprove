import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  HostListener,
  OnInit
} from '@angular/core';
import { DialogRef } from '@ngneat/dialog';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { APP_SPINNER_NAME } from '#common/constants/top-front';
import { ErEnum } from '#common/enums/er.enum';
import { isDefined } from '#common/functions/is-defined';

import type { ErrorData } from '#common/zod/front/error-data';
import { UiService } from '#front/app/services/ui.service';

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
    private spinner: NgxSpinnerService,
    private uiService: UiService
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

    if (
      [
        ErEnum.BACKEND_REPORT_DOES_NOT_EXIST as string,
        ErEnum.BACKEND_REPORT_NOT_FOUND as string
      ].indexOf(this.message) > -1
    ) {
      this.uiService.clearProjectReportLink();
    } else if (this.message === ErEnum.BACKEND_MODEL_DOES_NOT_EXIST) {
      this.uiService.clearProjectModelLink();
    } else if (this.message === ErEnum.BACKEND_DASHBOARD_DOES_NOT_EXIST) {
      this.uiService.clearProjectDashboardLink();
    } else if (this.message === ErEnum.BACKEND_CHART_DOES_NOT_EXIST) {
      this.uiService.clearProjectChartLink();
    }

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
