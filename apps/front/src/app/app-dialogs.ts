import { EmailConfirmedDialogComponent } from './modules/auth/main/03-confirm-email/email-confirmed-dialog/email-confirmed-dialog.component';
import { CreateOrgDialogComponent } from './modules/navbar/org-select/create-org-dialog/create-org-dialog.component';
import { CreateProjectDialogComponent } from './modules/navbar/project-select/create-project-dialog/create-project-dialog.component';
import { DeleteOrgDialogComponent } from './modules/org/org-account/delete-org-dialog/delete-org-dialog.component';
import { EditCompanySizeDialogComponent } from './modules/org/org-account/edit-company-size-dialog/edit-company-size-dialog.component';
import { EditOrgNameDialogComponent } from './modules/org/org-account/edit-org-name-dialog/edit-org-name-dialog.component';
import { EditOrgOwnerDialogComponent } from './modules/org/org-account/edit-org-owner-dialog/edit-org-owner-dialog.component';
import { EditPhoneNumberDialogComponent } from './modules/org/org-account/edit-phone-number-dialog/edit-phone-number-dialog.component';
import { DeleteUserDialogComponent } from './modules/profile/delete-user-dialog/delete-user-dialog.component';
import { EditNameDialogComponent } from './modules/profile/edit-name-dialog/edit-name-dialog.component';
import { EditPhotoDialogComponent } from './modules/profile/edit-photo-dialog/edit-photo-dialog.component';
import { EditTimezoneDialogComponent } from './modules/profile/edit-timezone-dialog/edit-timezone-dialog.component';
import { EditProjectNameDialogComponent } from './modules/project/project-settings/edit-project-name-dialog/edit-project-name-dialog.component';
import { PhotoDialogComponent } from './modules/shared/photo-dialog/photo-dialog.component';
import { ErrorDialogComponent } from './modules/special/error-dialog/error-dialog.component';

export const appDialogs = [
  ErrorDialogComponent,
  EmailConfirmedDialogComponent,
  PhotoDialogComponent,
  // navbar
  CreateOrgDialogComponent,
  CreateProjectDialogComponent,
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
  EditPhoneNumberDialogComponent,
  // project
  EditProjectNameDialogComponent
];
