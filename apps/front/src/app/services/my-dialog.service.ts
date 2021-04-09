import { Injectable } from '@angular/core';
import { DialogService } from '@ngneat/dialog';
import { ErrorDialogComponent } from '~front/app/dialogs/error-dialog/error-dialog.component';
import { constants } from '~front/barrels/constants';
import { interfaces } from '~front/barrels/interfaces';
import { EmailConfirmedDialogComponent } from '../dialogs/email-confirmed-dialog/email-confirmed-dialog.component';

@Injectable({ providedIn: 'root' })
export class MyDialogService {
  constructor(private dialogService: DialogService) {}

  showError(item: { errorData: interfaces.ErrorData; isThrow: boolean }): void {
    let { errorData, isThrow } = item;

    this.dialogService.open(ErrorDialogComponent, {
      data: errorData,
      enableClose: false
    });

    if (isThrow === true) {
      throw new Error(constants.SPECIAL_ERROR);
    }
  }

  showEmailConfirmed(): void {
    this.dialogService.open(EmailConfirmedDialogComponent, {
      enableClose: false
    });
  }
}
