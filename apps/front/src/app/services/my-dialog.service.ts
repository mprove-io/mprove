import { Injectable } from '@angular/core';
import { DialogService } from '@ngneat/dialog';
import { constants } from '~front/barrels/constants';
import { interfaces } from '~front/barrels/interfaces';
import { EmailConfirmedDialogComponent } from '../modules/auth/main/03-confirm-email/email-confirmed-dialog/email-confirmed-dialog.component';
import { CreateOrgDialogComponent } from '../modules/navbar/org-select/create-org-dialog/create-org-dialog.component';
import { CreateProjectDialogComponent } from '../modules/navbar/project-select/create-project-dialog/create-project-dialog.component';
import { DeleteOrgDialogComponent } from '../modules/org/org-account/delete-org-dialog/delete-org-dialog.component';
import { EditCompanySizeDialogComponent } from '../modules/org/org-account/edit-company-size-dialog/edit-company-size-dialog.component';
import { EditOrgNameDialogComponent } from '../modules/org/org-account/edit-org-name-dialog/edit-org-name-dialog.component';
import { EditOrgOwnerDialogComponent } from '../modules/org/org-account/edit-org-owner-dialog/edit-org-owner-dialog.component';
import { EditPhoneNumberDialogComponent } from '../modules/org/org-account/edit-phone-number-dialog/edit-phone-number-dialog.component';
import { DeleteUserDialogComponent } from '../modules/profile/delete-user-dialog/delete-user-dialog.component';
import { EditNameDialogComponent } from '../modules/profile/edit-name-dialog/edit-name-dialog.component';
import { EditPhotoDialogComponent } from '../modules/profile/edit-photo-dialog/edit-photo-dialog.component';
import { EditTimezoneDialogComponent } from '../modules/profile/edit-timezone-dialog/edit-timezone-dialog.component';
import { DeleteProjectDialogComponent } from '../modules/project/project-settings/delete-project-dialog/delete-project-dialog.component';
import { EditProjectNameDialogComponent } from '../modules/project/project-settings/edit-project-name-dialog/edit-project-name-dialog.component';
import { InviteMemberDialogComponent } from '../modules/project/project-team/invite-member-dialog/invite-member-dialog.component';
import { RemoveMemberDialogComponent } from '../modules/project/project-team/remove-member-dialog/remove-member-dialog.component';
import { PhotoDialogComponent } from '../modules/shared/photo-dialog/photo-dialog.component';
import { ErrorDialogComponent } from '../modules/special/error-dialog/error-dialog.component';
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

  showPhoto(item: { apiService: ApiService; avatarBig: string }): void {
    this.dialogService.open(PhotoDialogComponent, {
      enableClose: true,
      closeButton: true,
      data: {
        apiService: item.apiService,
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

  showCreateProject(item: { apiService: ApiService; orgId: string }): void {
    this.dialogService.open(CreateProjectDialogComponent, {
      enableClose: false,
      data: {
        apiService: item.apiService,
        orgId: item.orgId
      }
    });
  }

  showEditOrgName(item: {
    apiService: ApiService;
    orgId: string;
    orgName: string;
  }): void {
    this.dialogService.open(EditOrgNameDialogComponent, {
      enableClose: false,
      data: {
        apiService: item.apiService,
        orgId: item.orgId,
        orgName: item.orgName
      }
    });
  }

  showEditOrgOwner(item: {
    apiService: ApiService;
    orgId: string;
    ownerEmail: string;
  }): void {
    this.dialogService.open(EditOrgOwnerDialogComponent, {
      enableClose: false,
      data: {
        apiService: item.apiService,
        orgId: item.orgId,
        ownerEmail: item.ownerEmail
      }
    });
  }

  showEditCompanySize(item: {
    apiService: ApiService;
    orgId: string;
    companySize: string;
  }): void {
    this.dialogService.open(EditCompanySizeDialogComponent, {
      enableClose: false,
      data: {
        apiService: item.apiService,
        orgId: item.orgId,
        companySize: item.companySize
      }
    });
  }

  showEditPhoneNumber(item: {
    apiService: ApiService;
    orgId: string;
    contactPhone: string;
  }): void {
    this.dialogService.open(EditPhoneNumberDialogComponent, {
      enableClose: false,
      data: {
        apiService: item.apiService,
        orgId: item.orgId,
        contactPhone: item.contactPhone
      }
    });
  }

  showDeleteOrg(item: {
    apiService: ApiService;
    orgId: string;
    orgName: string;
  }): void {
    this.dialogService.open(DeleteOrgDialogComponent, {
      enableClose: false,
      data: {
        apiService: item.apiService,
        orgId: item.orgId,
        orgName: item.orgName
      }
    });
  }

  showEditProjectName(item: {
    apiService: ApiService;
    projectId: string;
    projectName: string;
  }): void {
    this.dialogService.open(EditProjectNameDialogComponent, {
      enableClose: false,
      data: {
        apiService: item.apiService,
        projectId: item.projectId,
        projectName: item.projectName
      }
    });
  }

  showDeleteProject(item: {
    apiService: ApiService;
    projectId: string;
    projectName: string;
  }): void {
    this.dialogService.open(DeleteProjectDialogComponent, {
      enableClose: false,
      data: {
        apiService: item.apiService,
        projectId: item.projectId,
        projectName: item.projectName
      }
    });
  }

  showInviteMember(item: { apiService: ApiService; projectId: string }): void {
    this.dialogService.open(InviteMemberDialogComponent, {
      enableClose: false,
      data: {
        apiService: item.apiService,
        projectId: item.projectId
      }
    });
  }

  showRemoveMember(item: {
    apiService: ApiService;
    projectId: string;
    memberId: string;
    email: string;
  }): void {
    this.dialogService.open(RemoveMemberDialogComponent, {
      enableClose: false,
      data: {
        apiService: item.apiService,
        projectId: item.projectId,
        memberId: item.memberId,
        email: item.email
      }
    });
  }
}
