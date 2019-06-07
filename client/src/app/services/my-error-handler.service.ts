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
    let dataName = err.data ? err.data.name : `[MyErrorHandler] ${err.message}`;
    let dataMessage = err.data ? err.data.message : undefined;
    let dataEventId = err.data ? err.data.event_id : undefined;

    let data = {
      name: dataName,
      message: dataMessage,
      event_id: dataEventId
    };

    let openDialogs = this.dialog.openDialogs;

    if (openDialogs.length < 5) {
      this.ngZone.run(() => {
        this.myDialogService.showErDialog(data);
      });
    }

    super.handleError(err);
  }
}
