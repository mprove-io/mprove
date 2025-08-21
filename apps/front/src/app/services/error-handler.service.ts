import { ErrorHandler, Injectable, Injector, NgZone } from '@angular/core';
import { DialogService } from '@ngneat/dialog';
import { SPECIAL_ERROR } from '~common/constants/top-front';
import { ErrorData } from '~common/interfaces/front/error-data';
import { ErrorDialogComponent } from '../modules/special/error-dialog/error-dialog.component';

@Injectable()
export class ErrorHandlerService extends ErrorHandler {
  constructor(
    readonly ngZone: NgZone,
    private injector: Injector
  ) {
    super();
  }

  handleError(e: any): void {
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
