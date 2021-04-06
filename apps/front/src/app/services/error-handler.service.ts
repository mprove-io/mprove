import { ErrorHandler, Injectable, Injector, NgZone } from '@angular/core';
import { DialogService } from '@ngneat/dialog';
import { ErrorDialogComponent } from '~front/app/dialogs/error-dialog/error-dialog.component';

@Injectable()
export class ErrorHandlerService extends ErrorHandler {
  constructor(readonly ngZone: NgZone, private injector: Injector) {
    super();
  }

  handleError(e: any): void {
    let dialog = this.injector.get(DialogService);

    // if (e instanceof ClientError) {
    console.log('response:', e.response);
    console.log(e.data?.response);
    console.log(e);
    console.log(e.prototype);
    // }

    this.ngZone.run(() => {
      dialog.open(ErrorDialogComponent, {
        data: e,
        enableClose: false
      });
    });

    super.handleError(e);
  }
}
