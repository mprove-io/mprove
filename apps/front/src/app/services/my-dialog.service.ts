import { Injectable } from '@angular/core';
import { DialogService } from '@ngneat/dialog';
import { constants } from '~front/barrels/constants';
import { interfaces } from '~front/barrels/interfaces';
import { EmailConfirmedDialogComponent } from '../modules/auth/main/03-confirm-email/email-confirmed-dialog/email-confirmed-dialog.component';
import {
  DashboardAddFilterDialogComponent,
  DashboardAddFilterDialogDataItem
} from '../modules/dashboard/dashboard-add-filter-dialog/dashboard-add-filter-dialog.component';
import {
  DashboardAddReportDialogComponent,
  DashboardAddReportDialogDataItem
} from '../modules/dashboard/dashboard-add-report-dialog/dashboard-add-report-dialog.component';
import {
  DashboardEditListenersDialogComponent,
  DashboardEditListenersDialogDataItem
} from '../modules/dashboard/dashboard-edit-listeners-dialog/dashboard-edit-listeners-dialog.component';
import {
  DashboardSaveAsDialogComponent,
  DashboardSaveAsDialogDataItem
} from '../modules/dashboard/dashboard-save-as-dialog/dashboard-save-as-dialog.component';
import {
  DashboardsNewDialogComponent,
  DashboardsNewDialogDataItem
} from '../modules/dashboards/dashboards-new-dialog/dashboards-new-dialog.component';
import {
  CommitDialogComponent,
  CommitDialogDialogDataItem
} from '../modules/files/commit-dialog/commit-dialog.component';
import {
  DeleteFileDialogComponent,
  DeleteFileDialogDataItem
} from '../modules/files/files-tree/file-options/delete-file-dialog/delete-file-dialog.component';
import {
  RenameFileDialogComponent,
  RenameFileDialogDataItem
} from '../modules/files/files-tree/file-options/rename-file-dialog/rename-file-dialog.component';
import {
  CreateFileDialogComponent,
  CreateFileDialogDataItem
} from '../modules/files/files-tree/folder-options/create-file-dialog/create-file-dialog.component';
import {
  CreateFolderDialogComponent,
  CreateFolderDialogDataItem
} from '../modules/files/files-tree/folder-options/create-folder-dialog/create-folder-dialog.component';
import {
  DeleteFolderDialogComponent,
  DeleteFolderDialogDataItem
} from '../modules/files/files-tree/folder-options/delete-folder-dialog/delete-folder-dialog.component';
import {
  RenameFolderDialogComponent,
  RenameFolderDialogDataItem
} from '../modules/files/files-tree/folder-options/rename-folder-dialog/rename-folder-dialog.component';
import {
  ChartSaveAsDialogComponent,
  ChartSaveAsDialogDataItem
} from '../modules/model/chart-save-as-dialog/chart-save-as-dialog.component';
import {
  ViewBlockmlDialogComponent,
  ViewBlockmlDialogDataItem
} from '../modules/model/view-blockml-dialog/view-blockml-dialog.component';
import {
  CreateBranchDialogComponent,
  CreateBranchDialogDataItem
} from '../modules/navbar/branch-select/create-branch-dialog/create-branch-dialog.component';
import {
  DeleteBranchDialogComponent,
  DeleteBranchDialogDataItem
} from '../modules/navbar/branch-select/delete-branch-dialog/delete-branch-dialog.component';
import {
  MergeBranchDialogComponent,
  MergeBranchDialogDataItem
} from '../modules/navbar/branch-select/merge-branch-dialog/merge-branch-dialog.component';
import {
  CreateOrgDialogComponent,
  CreateOrgDialogItem as CreateOrgDialogDataItem
} from '../modules/navbar/org-select/create-org-dialog/create-org-dialog.component';
import {
  CreateProjectDialogComponent,
  CreateProjectDialogDataItem
} from '../modules/navbar/project-select/create-project-dialog/create-project-dialog.component';
import {
  DeleteOrgDialogComponent,
  DeleteOrgDialogDataItem
} from '../modules/org/org-account/delete-org-dialog/delete-org-dialog.component';
import {
  EditCompanySizeDialogComponent,
  EditCompanySizeDialogDataItem
} from '../modules/org/org-account/edit-company-size-dialog/edit-company-size-dialog.component';
import {
  EditOrgNameDialogComponent,
  EditOrgNameDialogDataItem
} from '../modules/org/org-account/edit-org-name-dialog/edit-org-name-dialog.component';
import {
  EditOrgOwnerDialogComponent,
  EditOrgOwnerDialogDataItem
} from '../modules/org/org-account/edit-org-owner-dialog/edit-org-owner-dialog.component';
import {
  EditPhoneNumberDialogComponent,
  EditPhoneNumberDialogDataItem
} from '../modules/org/org-account/edit-phone-number-dialog/edit-phone-number-dialog.component';
import {
  DeleteUserDialogComponent,
  DeleteUserDialogItem as DeleteUserDialogDataItem
} from '../modules/profile/delete-user-dialog/delete-user-dialog.component';
import {
  EditNameDialogComponent,
  EditNameDialogItem as EditNameDialogDataItem
} from '../modules/profile/edit-name-dialog/edit-name-dialog.component';
import {
  EditPhotoDialogComponent,
  EditPhotoDialogItem as EditPhotoDialogDataItem
} from '../modules/profile/edit-photo-dialog/edit-photo-dialog.component';
import {
  EditTimezoneDialogComponent,
  EditTimezoneDialogItem as EditTimezoneDialogDataItem
} from '../modules/profile/edit-timezone-dialog/edit-timezone-dialog.component';
import {
  AddConnectionDialogComponent,
  AddConnectionDialogDataItem
} from '../modules/project/project-connections/add-connection-dialog/add-connection-dialog.component';
import {
  DeleteConnectionDialogComponent,
  DeleteConnectionDialogDataItem
} from '../modules/project/project-connections/delete-connection-dialog/delete-connection-dialog.component';
import {
  EditConnectionDialogComponent,
  EditConnectionDialogDataItem
} from '../modules/project/project-connections/edit-connection-dialog/edit-connection-dialog.component';
import {
  AddEnvironmentDialogComponent,
  AddEnvironmentDialogDataItem
} from '../modules/project/project-environments/add-environment-dialog/add-environment-dialog.component';
import {
  DeleteEnvironmentDialogComponent,
  DeleteEnvironmentDialogDataItem
} from '../modules/project/project-environments/delete-environment-dialog/delete-environment-dialog.component';
import {
  AddEvDialogComponent,
  AddEvDialogDataItem
} from '../modules/project/project-evs/add-ev-dialog/add-ev-dialog.component';
import {
  DeleteEvDialogComponent,
  DeleteEvDialogDataItem
} from '../modules/project/project-evs/delete-ev-dialog/delete-ev-dialog.component';
import {
  EditEvDialogComponent,
  EditEvDialogDataItem
} from '../modules/project/project-evs/edit-ev-dialog/edit-ev-dialog.component';
import {
  DeleteProjectDialogComponent,
  DeleteProjectDialogDataItem
} from '../modules/project/project-settings/delete-project-dialog/delete-project-dialog.component';
import {
  EditProjectNameDialogComponent,
  EditProjectNameDialogDataItem
} from '../modules/project/project-settings/edit-project-name-dialog/edit-project-name-dialog.component';
import {
  AddEnvDialogComponent,
  AddEnvDialogDataItem
} from '../modules/project/project-team/add-env-dialog/add-env-dialog.component';
import {
  AddRoleDialogComponent,
  AddRoleDialogDataItem
} from '../modules/project/project-team/add-role-dialog/add-role-dialog.component';
import {
  InviteMemberDialogComponent,
  InviteMemberDialogDataItem
} from '../modules/project/project-team/invite-member-dialog/invite-member-dialog.component';
import {
  RemoveMemberDialogComponent,
  RemoveMemberDialogDataItem
} from '../modules/project/project-team/remove-member-dialog/remove-member-dialog.component';
import {
  ChartDialogComponent,
  ChartDialogDataItem
} from '../modules/shared/chart-dialog/chart-dialog.component';
import {
  DeleteVizDialogComponent,
  DeleteVizDialogDataItem
} from '../modules/shared/chart-viz/delete-viz-dialog/delete-viz-dialog.component';
import {
  EditVizInfoDialogComponent,
  EditVizInfoDialogDataItem
} from '../modules/shared/chart-viz/edit-viz-info-dialog/edit-viz-info-dialog.component';
import {
  DeleteDashboardDialogComponent,
  DeleteDashboardDialogDataItem
} from '../modules/shared/delete-dashboard-dialog/delete-dashboard-dialog.component';
import {
  PhotoDialogComponent,
  PhotoDialogDataItem
} from '../modules/shared/photo-dialog/photo-dialog.component';
import { ErrorDialogComponent } from '../modules/special/error-dialog/error-dialog.component';
import {
  NewVizDialogComponent,
  NewVizDialogDataItem
} from '../modules/visualizations/new-viz-dialog/new-viz-dialog.component';

export interface ErrorDialogDataItem {
  errorData: interfaces.ErrorData;
  isThrow: boolean;
}

@Injectable({ providedIn: 'root' })
export class MyDialogService {
  constructor(private dialogService: DialogService) {}

  showError(item: ErrorDialogDataItem): void {
    let { errorData, isThrow } = item;

    if (this.dialogService.dialogs.length < 2) {
      this.dialogService.open(ErrorDialogComponent, {
        enableClose: false,
        closeButton: false,
        data: errorData,
        width: 900
      });
    }

    if (isThrow === true) {
      throw new Error(constants.SPECIAL_ERROR);
    }
  }

  showEmailConfirmed(): void {
    this.dialogService.open(EmailConfirmedDialogComponent, {
      enableClose: false,
      closeButton: false
    });
  }

  showPhoto(item: PhotoDialogDataItem): void {
    this.dialogService.open(PhotoDialogComponent, {
      enableClose: false,
      closeButton: true,
      data: item
    });
  }

  showEditPhoto(item: EditPhotoDialogDataItem): void {
    this.dialogService.open(EditPhotoDialogComponent, {
      enableClose: false,
      closeButton: false,
      data: item
    });
  }

  showEditName(item: EditNameDialogDataItem): void {
    this.dialogService.open(EditNameDialogComponent, {
      enableClose: false,
      closeButton: false,
      data: item
    });
  }

  showEditTimezone(item: EditTimezoneDialogDataItem): void {
    this.dialogService.open(EditTimezoneDialogComponent, {
      enableClose: false,
      closeButton: false,
      data: item
    });
  }

  showDeleteUser(item: DeleteUserDialogDataItem): void {
    this.dialogService.open(DeleteUserDialogComponent, {
      enableClose: false,
      closeButton: false,
      data: item
    });
  }

  showCreateOrg(item: CreateOrgDialogDataItem): void {
    this.dialogService.open(CreateOrgDialogComponent, {
      enableClose: false,
      closeButton: false,
      data: item
    });
  }

  showCreateProject(item: CreateProjectDialogDataItem): void {
    this.dialogService.open(CreateProjectDialogComponent, {
      enableClose: false,
      closeButton: false,
      data: item,
      width: 800
    });
  }

  showCreateBranch(item: CreateBranchDialogDataItem): void {
    this.dialogService.open(CreateBranchDialogComponent, {
      enableClose: false,
      closeButton: false,
      data: item
    });
  }

  showViewBlockml(item: ViewBlockmlDialogDataItem): void {
    this.dialogService.open(ViewBlockmlDialogComponent, {
      enableClose: false,
      closeButton: true,
      data: item,
      width: 1024
    });
  }

  showChart(item: ChartDialogDataItem): void {
    this.dialogService.open(ChartDialogComponent, {
      enableClose: false,
      closeButton: true,
      data: item,
      width: '80vw',
      height: '80vh'
    });
  }

  showChartSaveAs(item: ChartSaveAsDialogDataItem): void {
    this.dialogService.open(ChartSaveAsDialogComponent, {
      enableClose: false,
      closeButton: false,
      data: item,
      width: 900
    });
  }

  showDashboardSaveAs(item: DashboardSaveAsDialogDataItem): void {
    this.dialogService.open(DashboardSaveAsDialogComponent, {
      enableClose: false,
      closeButton: false,
      data: item,
      width: 900
    });
  }

  showDashboardAddReport(item: DashboardAddReportDialogDataItem): void {
    this.dialogService.open(DashboardAddReportDialogComponent, {
      enableClose: false,
      closeButton: true,
      data: item,
      width: 640
    });
  }

  showDashboardAddFilter(item: DashboardAddFilterDialogDataItem): void {
    this.dialogService.open(DashboardAddFilterDialogComponent, {
      enableClose: false,
      closeButton: false,
      data: item,
      width: 640
    });
  }

  showDashboardEditListeners(item: DashboardEditListenersDialogDataItem): void {
    this.dialogService.open(DashboardEditListenersDialogComponent, {
      enableClose: false,
      closeButton: false,
      data: item,
      width: '90vw',
      height: '80vh'
    });
  }

  showDashboardsNew(item: DashboardsNewDialogDataItem): void {
    this.dialogService.open(DashboardsNewDialogComponent, {
      enableClose: false,
      closeButton: false,
      data: item,
      width: 640
    });
  }

  showEditVizInfo(item: EditVizInfoDialogDataItem): void {
    this.dialogService.open(EditVizInfoDialogComponent, {
      enableClose: false,
      closeButton: false,
      data: item,
      width: 640
    });
  }

  showNewViz(item: NewVizDialogDataItem): void {
    this.dialogService.open(NewVizDialogComponent, {
      enableClose: false,
      closeButton: true,
      data: item
    });
  }

  showDeleteViz(item: DeleteVizDialogDataItem): void {
    this.dialogService.open(DeleteVizDialogComponent, {
      enableClose: false,
      closeButton: false,
      data: item
    });
  }

  showDeleteDashboard(item: DeleteDashboardDialogDataItem): void {
    this.dialogService.open(DeleteDashboardDialogComponent, {
      enableClose: false,
      closeButton: false,
      data: item
    });
  }

  showMergeBranch(item: MergeBranchDialogDataItem): void {
    this.dialogService.open(MergeBranchDialogComponent, {
      enableClose: false,
      closeButton: false,
      data: item
    });
  }

  showCommit(item: CommitDialogDialogDataItem): void {
    this.dialogService.open(CommitDialogComponent, {
      enableClose: false,
      closeButton: false,
      data: item,
      width: 800
    });
  }

  showDeleteBranch(item: DeleteBranchDialogDataItem): void {
    this.dialogService.open(DeleteBranchDialogComponent, {
      enableClose: false,
      closeButton: false,
      data: item,
      width: 900
    });
  }

  showEditOrgName(item: EditOrgNameDialogDataItem): void {
    this.dialogService.open(EditOrgNameDialogComponent, {
      enableClose: false,
      closeButton: false,
      data: item
    });
  }

  showEditOrgOwner(item: EditOrgOwnerDialogDataItem): void {
    this.dialogService.open(EditOrgOwnerDialogComponent, {
      enableClose: false,
      closeButton: false,
      data: item
    });
  }

  showEditCompanySize(item: EditCompanySizeDialogDataItem): void {
    this.dialogService.open(EditCompanySizeDialogComponent, {
      enableClose: false,
      closeButton: false,
      data: item
    });
  }

  showEditPhoneNumber(item: EditPhoneNumberDialogDataItem): void {
    this.dialogService.open(EditPhoneNumberDialogComponent, {
      enableClose: false,
      closeButton: false,
      data: item
    });
  }

  showDeleteOrg(item: DeleteOrgDialogDataItem): void {
    this.dialogService.open(DeleteOrgDialogComponent, {
      enableClose: false,
      closeButton: false,
      data: item
    });
  }

  showEditProjectName(item: EditProjectNameDialogDataItem): void {
    this.dialogService.open(EditProjectNameDialogComponent, {
      enableClose: false,
      closeButton: false,
      data: item
    });
  }

  showDeleteProject(item: DeleteProjectDialogDataItem): void {
    this.dialogService.open(DeleteProjectDialogComponent, {
      enableClose: false,
      closeButton: false,
      data: item
    });
  }

  showInviteMember(item: InviteMemberDialogDataItem): void {
    this.dialogService.open(InviteMemberDialogComponent, {
      enableClose: false,
      closeButton: false,
      data: item
    });
  }

  showRemoveMember(item: RemoveMemberDialogDataItem): void {
    this.dialogService.open(RemoveMemberDialogComponent, {
      enableClose: false,
      closeButton: false,
      data: item
    });
  }

  showAddRole(item: AddRoleDialogDataItem): void {
    this.dialogService.open(AddRoleDialogComponent, {
      enableClose: false,
      closeButton: false,
      data: item
    });
  }

  showAddEnv(item: AddEnvDialogDataItem): void {
    this.dialogService.open(AddEnvDialogComponent, {
      enableClose: false,
      closeButton: false,
      data: item
    });
  }

  showAddConnection(item: AddConnectionDialogDataItem): void {
    this.dialogService.open(AddConnectionDialogComponent, {
      enableClose: false,
      closeButton: false,
      data: item
    });
  }

  showEditConnection(item: EditConnectionDialogDataItem): void {
    this.dialogService.open(EditConnectionDialogComponent, {
      enableClose: false,
      closeButton: false,
      data: item
    });
  }

  showDeleteConnection(item: DeleteConnectionDialogDataItem): void {
    this.dialogService.open(DeleteConnectionDialogComponent, {
      enableClose: false,
      closeButton: false,
      data: item
    });
  }

  showAddEnvironment(item: AddEnvironmentDialogDataItem): void {
    this.dialogService.open(AddEnvironmentDialogComponent, {
      enableClose: false,
      closeButton: false,
      data: item
    });
  }

  showAddEv(item: AddEvDialogDataItem): void {
    this.dialogService.open(AddEvDialogComponent, {
      enableClose: false,
      closeButton: false,
      data: item,
      width: 800
    });
  }

  showEditEv(item: EditEvDialogDataItem): void {
    this.dialogService.open(EditEvDialogComponent, {
      enableClose: false,
      closeButton: false,
      data: item,
      width: 800
    });
  }

  showDeleteEv(item: DeleteEvDialogDataItem): void {
    this.dialogService.open(DeleteEvDialogComponent, {
      enableClose: false,
      closeButton: false,
      data: item,
      width: 800
    });
  }

  showDeleteEnvironment(item: DeleteEnvironmentDialogDataItem): void {
    this.dialogService.open(DeleteEnvironmentDialogComponent, {
      enableClose: false,
      closeButton: false,
      data: item
    });
  }

  showCreateFolder(item: CreateFolderDialogDataItem): void {
    this.dialogService.open(CreateFolderDialogComponent, {
      enableClose: false,
      closeButton: false,
      data: item,
      width: 700
    });
  }

  showCreateFile(item: CreateFileDialogDataItem): void {
    this.dialogService.open(CreateFileDialogComponent, {
      enableClose: false,
      closeButton: false,
      data: item,
      width: 700
    });
  }

  showDeleteFolder(item: DeleteFolderDialogDataItem): void {
    this.dialogService.open(DeleteFolderDialogComponent, {
      enableClose: false,
      closeButton: false,
      data: item
    });
  }

  showRenameFolder(item: RenameFolderDialogDataItem): void {
    this.dialogService.open(RenameFolderDialogComponent, {
      enableClose: false,
      closeButton: false,
      data: item,
      width: 700
    });
  }

  showRenameFile(item: RenameFileDialogDataItem): void {
    this.dialogService.open(RenameFileDialogComponent, {
      enableClose: false,
      closeButton: false,
      data: item,
      width: 700
    });
  }

  showDeleteFile(item: DeleteFileDialogDataItem): void {
    this.dialogService.open(DeleteFileDialogComponent, {
      enableClose: false,
      closeButton: false,
      data: item
    });
  }
}
