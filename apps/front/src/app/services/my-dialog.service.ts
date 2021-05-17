import { Injectable } from '@angular/core';
import { DialogService } from '@ngneat/dialog';
import { common } from '~front/barrels/common';
import { constants } from '~front/barrels/constants';
import { interfaces } from '~front/barrels/interfaces';
import { BranchItem } from '../interfaces/_index';
import { EmailConfirmedDialogComponent } from '../modules/auth/main/03-confirm-email/email-confirmed-dialog/email-confirmed-dialog.component';
import { CreateBranchDialogComponent } from '../modules/navbar/branch-select/create-branch-dialog/create-branch-dialog.component';
import { DeleteBranchDialogComponent } from '../modules/navbar/branch-select/delete-branch-dialog/delete-branch-dialog.component';
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
import { AddConnectionDialogComponent } from '../modules/project/project-connections/add-connection-dialog/add-connection-dialog.component';
import { DeleteConnectionDialogComponent } from '../modules/project/project-connections/delete-connection-dialog/delete-connection-dialog.component';
import { EditConnectionDialogComponent } from '../modules/project/project-connections/edit-connection-dialog/edit-connection-dialog.component';
import { DeleteProjectDialogComponent } from '../modules/project/project-settings/delete-project-dialog/delete-project-dialog.component';
import { EditProjectNameDialogComponent } from '../modules/project/project-settings/edit-project-name-dialog/edit-project-name-dialog.component';
import { AddRoleDialogComponent } from '../modules/project/project-team/add-role-dialog/add-role-dialog.component';
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

  showCreateBranch(item: {
    apiService: ApiService;
    orgId: string;
    projectId: string;
    branchesList: BranchItem[];
    selectedBranchItem: BranchItem;
    selectedBranchExtraId: string;
  }): void {
    this.dialogService.open(CreateBranchDialogComponent, {
      enableClose: false,
      data: item
    });
  }

  showDeleteBranch(item: {
    apiService: ApiService;
    orgId: string;
    projectId: string;
    branchId: string;
    isRepoProd: boolean;
    alias: string;
  }): void {
    this.dialogService.open(DeleteBranchDialogComponent, {
      enableClose: false,
      data: item
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

  showAddRole(item: {
    apiService: ApiService;
    member: common.Member;
    i: number;
  }): void {
    this.dialogService.open(AddRoleDialogComponent, {
      enableClose: false,
      data: {
        apiService: item.apiService,
        member: item.member,
        i: item.i
      }
    });
  }

  showAddConnection(item: { apiService: ApiService; projectId: string }): void {
    this.dialogService.open(AddConnectionDialogComponent, {
      enableClose: false,
      data: {
        apiService: item.apiService,
        projectId: item.projectId
      }
    });
  }

  showDeleteConnection(item: {
    apiService: ApiService;
    projectId: string;
    connectionId: string;
  }): void {
    this.dialogService.open(DeleteConnectionDialogComponent, {
      enableClose: false,
      data: {
        apiService: item.apiService,
        projectId: item.projectId,
        connectionId: item.connectionId
      }
    });
  }

  showEditConnection(item: {
    apiService: ApiService;
    connection: common.Connection;
    i: number;
  }): void {
    this.dialogService.open(EditConnectionDialogComponent, {
      enableClose: false,
      data: {
        apiService: item.apiService,
        connection: item.connection,
        i: item.i
      }
    });
  }
}
