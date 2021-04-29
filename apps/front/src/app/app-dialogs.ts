import { CreateOrgDialogComponent } from './dialogs/create-org-dialog/create-org-dialog.component';
import { EmailConfirmedDialogComponent } from './dialogs/email-confirmed-dialog/email-confirmed-dialog.component';
import { ErrorDialogComponent } from './dialogs/error-dialog/error-dialog.component';
import { DeleteOrgDialogComponent } from './dialogs/org-account/delete-org-dialog/delete-org-dialog.component';
import { EditCompanySizeDialogComponent } from './dialogs/org-account/edit-company-size-dialog/edit-company-size-dialog.component';
import { EditOrgNameDialogComponent } from './dialogs/org-account/edit-org-name-dialog/edit-org-name-dialog.component';
import { EditOrgOwnerDialogComponent } from './dialogs/org-account/edit-org-owner-dialog/edit-org-owner-dialog.component';
import { EditPhoneNumberDialogComponent } from './dialogs/org-account/edit-phone-number-dialog/edit-phone-number-dialog.component';
import { PhotoDialogComponent } from './dialogs/photo-dialog/photo-dialog.component';
import { DeleteUserDialogComponent } from './dialogs/profile/delete-user-dialog/delete-user-dialog.component';
import { EditNameDialogComponent } from './dialogs/profile/edit-name-dialog/edit-name-dialog.component';
import { EditPhotoDialogComponent } from './dialogs/profile/edit-photo-dialog/edit-photo-dialog.component';
import { EditTimezoneDialogComponent } from './dialogs/profile/edit-timezone-dialog/edit-timezone-dialog.component';

export const appDialogs = [
  ErrorDialogComponent,
  EmailConfirmedDialogComponent,
  PhotoDialogComponent,
  CreateOrgDialogComponent,
  // profile
  EditPhotoDialogComponent,
  EditNameDialogComponent,
  EditTimezoneDialogComponent,
  DeleteUserDialogComponent,
  // org-account
  EditOrgNameDialogComponent,
  EditCompanySizeDialogComponent,
  DeleteOrgDialogComponent,
  EditOrgOwnerDialogComponent,
  EditPhoneNumberDialogComponent
];
