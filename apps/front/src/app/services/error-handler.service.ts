import { ErrorHandler, Injectable, Injector, NgZone } from '@angular/core';
import { DialogService } from '@ngneat/dialog';
import { ErrorDialogComponent } from '~front/app/dialogs/error-dialog/error-dialog.component';

@Injectable()
export class ErrorHandlerService extends ErrorHandler {
  constructor(readonly ngZone: NgZone, private injector: Injector) {
    super();
  }

  handleError(err: any): void {
    let dialog = this.injector.get(DialogService);

    this.ngZone.run(() => {
      dialog.open(ErrorDialogComponent, {
        data: err.data,
        enableClose: false
      });
    });

    super.handleError(err);
  }
}
