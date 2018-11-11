import { ErrorHandler, Injectable, Injector } from '@angular/core';
import { MatDialog } from '@angular/material';
import * as Raven from 'raven-js';
import { MyDialogService } from 'src/app/services/my-dialog.service';

const main = MAIN;

@Injectable()
export class MyErrorHandler extends ErrorHandler {

  dialog: MatDialog = this.injector.get<MatDialog>(MatDialog);

  constructor(
    private injector: Injector,
    private myDialogService: MyDialogService,
  ) {

    super();
  }

  handleError(err: any): void {
    if (!err.data) {
      err.name = `[MyErrorHandler] ${err.message}`;
      err.message = `[MyErrorHandler] ${err.message}: -`;

      err.data = {
        name: err.name,
        message: '-'
      };
    }

    if (main === true) {
      Raven.captureException(err);
      err.data.event_id = Raven.lastEventId();
    }

    let openDialogs = this.dialog.openDialogs;

    if (openDialogs.length < 5) {
      this.myDialogService.showErDialog({ error: err });
    }

    super.handleError(err);
  }
}
