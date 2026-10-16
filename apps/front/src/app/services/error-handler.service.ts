import { ErrorHandler, Injectable, Injector, NgZone } from '@angular/core';
import { DialogService } from '@ngneat/dialog';
import { SPECIAL_ERROR } from '#common/constants/top-front';
import type { ErrorData } from '#common/types/front/ui/error-data';
import { ApiRequestError } from '#front/app/classes/api-request-error/api-request-error';
import { ErrorDialogComponent } from '../modules/special/error-dialog/error-dialog.component';
import { ApiService } from './api.service';

@Injectable()
export class ErrorHandlerService extends ErrorHandler {
  constructor(
    readonly ngZone: NgZone,
    private injector: Injector
  ) {
    super();
  }

  handleError(e: any): void {
    if (e instanceof ApiRequestError) {
      let apiService: ApiService = this.injector.get(ApiService);

      this.ngZone.run(() => {
        apiService.presentError({ errorData: e.errorData });
      });

      super.handleError(e);

      return;
    }

    let dialogService = this.injector.get(DialogService);

    if (e.message !== SPECIAL_ERROR) {
      this.ngZone.run(() => {
        let errorData: ErrorData = {
          message: e.message || e,
          skipLogToConsole: true
        };

        if (dialogService.dialogs.length < 2) {
          dialogService.open(ErrorDialogComponent, {
            data: errorData,
            enableClose: false,
            width: 650
          });
        }
      });
    }

    super.handleError(e);
  }
}
