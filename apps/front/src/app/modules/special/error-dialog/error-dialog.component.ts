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
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { ErrorData } from '#common/types/front/ui/error-data';
import type { Er } from '#common/types/shared/errors/er';
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
  displayData: string;

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
      this.ref.data?.response?.body?.error?.code ||
      this.ref.data?.message ||
      this.ref.data;

    let displayData = this.ref.data?.response?.body?.error?.displayData;
    if (isDefined(displayData)) {
      this.displayData = JSON.stringify(displayData, undefined, 2);
    }

    this.originalErrorMessage =
      this.ref.data?.response?.body?.error?.originalError?.code ||
      this.ref.data?.response?.body?.error?.originalError?.message;

    this.path = this.ref.data?.reqUrl;
    this.traceId = this.ref.data?.reqBody?.traceId;

    if (
      [
        'BACKEND_REPORT_DOES_NOT_EXIST' satisfies Er as string,
        'BACKEND_REPORT_NOT_FOUND' satisfies Er as string
      ].indexOf(this.message) > -1
    ) {
      this.uiService.clearProjectReportLink();
    } else if (this.message === ('BACKEND_MODEL_DOES_NOT_EXIST' satisfies Er)) {
      this.uiService.clearProjectModelLink();
    } else if (
      this.message === ('BACKEND_DASHBOARD_DOES_NOT_EXIST' satisfies Er)
    ) {
      this.uiService.clearProjectDashboardLink();
    } else if (this.message === ('BACKEND_CHART_DOES_NOT_EXIST' satisfies Er)) {
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
