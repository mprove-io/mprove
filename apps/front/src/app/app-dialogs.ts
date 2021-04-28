import { CreateOrgDialogComponent } from './dialogs/create-org-dialog/create-org-dialog.component';
import { DeleteOrgDialogComponent } from './dialogs/delete-org-dialog/delete-org-dialog.component';
import { DeleteUserDialogComponent } from './dialogs/delete-user-dialog/delete-user-dialog.component';
import { EditNameDialogComponent } from './dialogs/edit-name-dialog/edit-name-dialog.component';
import { EditOrgNameDialogComponent } from './dialogs/edit-org-name-dialog/edit-org-name-dialog.component';
import { EditPhotoDialogComponent } from './dialogs/edit-photo-dialog/edit-photo-dialog.component';
import { EditTimezoneDialogComponent } from './dialogs/edit-timezone-dialog/edit-timezone-dialog.component';
import { EmailConfirmedDialogComponent } from './dialogs/email-confirmed-dialog/email-confirmed-dialog.component';
import { ErrorDialogComponent } from './dialogs/error-dialog/error-dialog.component';
import { PhotoDialogComponent } from './dialogs/photo-dialog/photo-dialog.component';

export const appDialogs = [
  ErrorDialogComponent,
  EmailConfirmedDialogComponent,
  EditNameDialogComponent,
  DeleteOrgDialogComponent,
  DeleteUserDialogComponent,
  EditTimezoneDialogComponent,
  EditPhotoDialogComponent,
  PhotoDialogComponent,
  CreateOrgDialogComponent,
  EditOrgNameDialogComponent
];
