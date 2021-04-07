import { ErrorHandler, Injectable, Injector, NgZone } from '@angular/core';
import { DialogService } from '@ngneat/dialog';
import { ErrorDialogComponent } from '~front/app/dialogs/error-dialog/error-dialog.component';

@Injectable()
export class ErrorHandlerService extends ErrorHandler {
  constructor(readonly ngZone: NgZone, private injector: Injector) {
    super();
  }

  handleError(e: any): void {
    let dialogService = this.injector.get(DialogService);

    this.ngZone.run(() => {
      dialogService.open(ErrorDialogComponent, {
        data: e,
        enableClose: false
      });
    });

    console.log('e.stack:');
    console.log(e.stack);

    super.handleError(e);
  }
}
