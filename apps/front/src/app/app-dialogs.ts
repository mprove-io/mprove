import { DeleteUserDialogComponent } from './dialogs/delete-user-dialog/delete-user-dialog.component';
import { EditNameDialogComponent } from './dialogs/edit-name-dialog/edit-name-dialog.component';
import { EditPhotoDialogComponent } from './dialogs/edit-photo-dialog/edit-photo-dialog.component';
import { EditTimezoneDialogComponent } from './dialogs/edit-timezone-dialog/edit-timezone-dialog.component';
import { EmailConfirmedDialogComponent } from './dialogs/email-confirmed-dialog/email-confirmed-dialog.component';
import { ErrorDialogComponent } from './dialogs/error-dialog/error-dialog.component';

export const appDialogs = [
  ErrorDialogComponent,
  EmailConfirmedDialogComponent,
  EditNameDialogComponent,
  DeleteUserDialogComponent,
  EditTimezoneDialogComponent,
  EditPhotoDialogComponent
];
