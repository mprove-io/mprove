import { Injectable } from '@angular/core';
import { DialogService } from '@ngneat/dialog';
import { ErrorDialogComponent } from '~front/app/dialogs/error-dialog/error-dialog.component';
import { interfaces } from '~front/barrels/interfaces';

@Injectable({ providedIn: 'root' })
export class MyDialogService {
  constructor(private dialogService: DialogService) {}

  showError(errorData: interfaces.ErrorData): void {
    this.dialogService.open(ErrorDialogComponent, {
      data: errorData,
      enableClose: false
    });

    throw new Error('789');
  }
}
