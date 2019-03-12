import { ErrorHandler, Injectable, Injector } from '@angular/core';
import { MatDialog } from '@angular/material';
import { MyDialogService } from '@app/services/my-dialog.service';
import { environment } from '@env/environment';
import { NgZone } from '@angular/core';

@Injectable()
export class MyErrorHandler extends ErrorHandler {
  dialog: MatDialog = this.injector.get<MatDialog>(MatDialog);

  constructor(
    private injector: Injector,
    private myDialogService: MyDialogService,
    readonly ngZone: NgZone
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

    let openDialogs = this.dialog.openDialogs;

    if (openDialogs.length < 5) {
      this.ngZone.run(() => {
        this.myDialogService.showErDialog({ error: err });
      });
    }

    super.handleError(err);
  }
}
