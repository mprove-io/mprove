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

    // let dataName = err.data ? err.data.name : `[MyErrorHandler] ${err.message}`;
    // let dataMessage = err.data ? err.data.message : undefined;
    // let dataEventId = err.data ? err.data.event_id : undefined;

    // let data = {
    //   name: dataName,
    //   message: dataMessage,
    //   event_id: dataEventId
    // };

    // let openDialogs = this.dialog.openDialogs;

    // if (openDialogs.length < 5) {
    this.ngZone.run(() => {
      dialog.open(ErrorDialogComponent, {
        data: err.data,
        enableClose: false
      });
    });
    // }

    super.handleError(err);
  }
}
