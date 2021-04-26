import { Injectable } from '@angular/core';
import { DialogService } from '@ngneat/dialog';
import { ErrorDialogComponent } from '~front/app/dialogs/error-dialog/error-dialog.component';
import { constants } from '~front/barrels/constants';
import { interfaces } from '~front/barrels/interfaces';
import { CreateOrgDialogComponent } from '../dialogs/create-org-dialog/create-org-dialog.component';
import { DeleteUserDialogComponent } from '../dialogs/delete-user-dialog/delete-user-dialog.component';
import { EditNameDialogComponent } from '../dialogs/edit-name-dialog/edit-name-dialog.component';
import { EditPhotoDialogComponent } from '../dialogs/edit-photo-dialog/edit-photo-dialog.component';
import { EditTimezoneDialogComponent } from '../dialogs/edit-timezone-dialog/edit-timezone-dialog.component';
import { EmailConfirmedDialogComponent } from '../dialogs/email-confirmed-dialog/email-confirmed-dialog.component';
import { PhotoDialogComponent } from '../dialogs/photo-dialog/photo-dialog.component';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class MyDialogService {
  constructor(private dialogService: DialogService) {}

  showError(item: { errorData: interfaces.ErrorData; isThrow: boolean }): void {
    let { errorData, isThrow } = item;

    this.dialogService.open(ErrorDialogComponent, {
      enableClose: false,
      data: errorData
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

  showPhoto(item: {
    apiService: ApiService;
    userId: string;
    avatarBig: string;
  }): void {
    this.dialogService.open(PhotoDialogComponent, {
      enableClose: true,
      closeButton: true,
      data: {
        apiService: item.apiService,
        userId: item.userId,
        avatarBig: item.avatarBig
      }
    });
  }

  showEditPhoto(item: { apiService: ApiService }): void {
    this.dialogService.open(EditPhotoDialogComponent, {
      enableClose: false,
      data: {
        apiService: item.apiService
      }
    });
  }

  showEditName(item: { apiService: ApiService }): void {
    this.dialogService.open(EditNameDialogComponent, {
      enableClose: false,
      data: {
        apiService: item.apiService
      }
    });
  }

  showEditTimezone(item: { apiService: ApiService }): void {
    this.dialogService.open(EditTimezoneDialogComponent, {
      enableClose: false,
      data: {
        apiService: item.apiService
      }
    });
  }

  showDeleteUser(item: { apiService: ApiService }): void {
    this.dialogService.open(DeleteUserDialogComponent, {
      enableClose: false,
      data: {
        apiService: item.apiService
      }
    });
  }

  showCreateOrg(item: { apiService: ApiService }): void {
    this.dialogService.open(CreateOrgDialogComponent, {
      enableClose: false,
      data: {
        apiService: item.apiService
      }
    });
  }
}
