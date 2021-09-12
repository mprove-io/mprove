import { ErrorHandler, Injectable, Injector, NgZone } from '@angular/core';
import { DialogService } from '@ngneat/dialog';
import { constants } from '~front/barrels/constants';
import { interfaces } from '~front/barrels/interfaces';
import { ErrorDialogComponent } from '../modules/special/error-dialog/error-dialog.component';

@Injectable()
export class ErrorHandlerService extends ErrorHandler {
  constructor(readonly ngZone: NgZone, private injector: Injector) {
    super();
  }

  handleError(e: any): void {
    let dialogService = this.injector.get(DialogService);

    if (e.message !== constants.SPECIAL_ERROR) {
      this.ngZone.run(() => {
        let errorData: interfaces.ErrorData = {
          message: e.message || e,
          skipLogToConsole: true
        };

        dialogService.open(ErrorDialogComponent, {
          data: errorData,
          enableClose: false,
          width: 650
        });
      });
    }

    super.handleError(e);
  }
}
