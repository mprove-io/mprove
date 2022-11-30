import { Injectable } from '@angular/core';
import { DialogService } from '@ngneat/dialog';
import { constants } from '~front/barrels/constants';
import { interfaces } from '~front/barrels/interfaces';
import { EmailConfirmedDialogComponent } from '../modules/auth/main/03-confirm-email/email-confirmed-dialog/email-confirmed-dialog.component';
import {
  DashboardAddFilterDialogComponent,
  DashboardAddFilterDialogData
} from '../modules/dashboard/dashboard-add-filter-dialog/dashboard-add-filter-dialog.component';
import {
  DashboardAddReportDialogComponent,
  DashboardAddReportDialogData
} from '../modules/dashboard/dashboard-add-report-dialog/dashboard-add-report-dialog.component';
import {
  DashboardEditListenersDialogComponent,
  DashboardEditListenersDialogData
} from '../modules/dashboard/dashboard-edit-listeners-dialog/dashboard-edit-listeners-dialog.component';
import {
  DashboardSaveAsDialogComponent,
  DashboardSaveAsDialogData
} from '../modules/dashboard/dashboard-save-as-dialog/dashboard-save-as-dialog.component';
import {
  DashboardsNewDialogComponent,
  DashboardsNewDialogData
} from '../modules/dashboards/dashboards-new-dialog/dashboards-new-dialog.component';
import {
  CommitDialogComponent,
  CommitDialogDialogData
} from '../modules/files/commit-dialog/commit-dialog.component';
import {
  DeleteFileDialogComponent,
  DeleteFileDialogData
} from '../modules/files/files-tree/file-options/delete-file-dialog/delete-file-dialog.component';
import {
  RenameFileDialogComponent,
  RenameFileDialogData
} from '../modules/files/files-tree/file-options/rename-file-dialog/rename-file-dialog.component';
import {
  CreateFileDialogComponent,
  CreateFileDialogData
} from '../modules/files/files-tree/folder-options/create-file-dialog/create-file-dialog.component';
import {
  CreateFolderDialogComponent,
  CreateFolderDialogData
} from '../modules/files/files-tree/folder-options/create-folder-dialog/create-folder-dialog.component';
import {
  DeleteFolderDialogComponent,
  DeleteFolderDialogData
} from '../modules/files/files-tree/folder-options/delete-folder-dialog/delete-folder-dialog.component';
import {
  RenameFolderDialogComponent,
  RenameFolderDialogData
} from '../modules/files/files-tree/folder-options/rename-folder-dialog/rename-folder-dialog.component';
import {
  ChartSaveAsDialogComponent,
  ChartSaveAsDialogData
} from '../modules/model/chart-save-as-dialog/chart-save-as-dialog.component';
import {
  ViewBlockmlDialogComponent,
  ViewBlockmlDialogData
} from '../modules/model/view-blockml-dialog/view-blockml-dialog.component';
import {
  CreateBranchDialogComponent,
  CreateBranchDialogData
} from '../modules/navbar/branch-select/create-branch-dialog/create-branch-dialog.component';
import {
  DeleteBranchDialogComponent,
  DeleteBranchDialogData
} from '../modules/navbar/branch-select/delete-branch-dialog/delete-branch-dialog.component';
import {
  MergeBranchDialogComponent,
  MergeBranchDialogData
} from '../modules/navbar/branch-select/merge-branch-dialog/merge-branch-dialog.component';
import {
  CreateOrgDialogComponent,
  CreateOrgDialogData
} from '../modules/navbar/org-select/create-org-dialog/create-org-dialog.component';
import {
  CreateProjectDialogComponent,
  CreateProjectDialogData
} from '../modules/navbar/project-select/create-project-dialog/create-project-dialog.component';
import {
  DeleteOrgDialogComponent,
  DeleteOrgDialogData
} from '../modules/org/org-account/delete-org-dialog/delete-org-dialog.component';
import {
  EditOrgNameDialogComponent,
  EditOrgNameDialogData
} from '../modules/org/org-account/edit-org-name-dialog/edit-org-name-dialog.component';
import {
  EditOrgOwnerDialogComponent,
  EditOrgOwnerDialogData
} from '../modules/org/org-account/edit-org-owner-dialog/edit-org-owner-dialog.component';
import { ApiKeyDialogComponent } from '../modules/profile/api-key-dialog/api-key-dialog.component';
import {
  DeleteUserDialogComponent,
  DeleteUserDialogData
} from '../modules/profile/delete-user-dialog/delete-user-dialog.component';
import {
  EditNameDialogComponent,
  EditNameDialogData
} from '../modules/profile/edit-name-dialog/edit-name-dialog.component';
import {
  EditPhotoDialogComponent,
  EditPhotoDialogData
} from '../modules/profile/edit-photo-dialog/edit-photo-dialog.component';
import {
  EditTimezoneDialogComponent,
  EditTimezoneDialogData
} from '../modules/profile/edit-timezone-dialog/edit-timezone-dialog.component';
import {
  AddConnectionDialogComponent,
  AddConnectionDialogData
} from '../modules/project/project-connections/add-connection-dialog/add-connection-dialog.component';
import {
  DeleteConnectionDialogComponent,
  DeleteConnectionDialogData
} from '../modules/project/project-connections/delete-connection-dialog/delete-connection-dialog.component';
import {
  EditConnectionDialogComponent,
  EditConnectionDialogData
} from '../modules/project/project-connections/edit-connection-dialog/edit-connection-dialog.component';
import {
  AddEnvironmentDialogComponent,
  AddEnvironmentDialogData
} from '../modules/project/project-environments/add-environment-dialog/add-environment-dialog.component';
import {
  DeleteEnvironmentDialogComponent,
  DeleteEnvironmentDialogData
} from '../modules/project/project-environments/delete-environment-dialog/delete-environment-dialog.component';
import {
  AddEvDialogComponent,
  AddEvDialogData
} from '../modules/project/project-evs/add-ev-dialog/add-ev-dialog.component';
import {
  DeleteEvDialogComponent,
  DeleteEvDialogData
} from '../modules/project/project-evs/delete-ev-dialog/delete-ev-dialog.component';
import {
  EditEvDialogComponent,
  EditEvDialogData
} from '../modules/project/project-evs/edit-ev-dialog/edit-ev-dialog.component';
import {
  DeleteProjectDialogComponent,
  DeleteProjectDialogData
} from '../modules/project/project-settings/delete-project-dialog/delete-project-dialog.component';
import {
  EditProjectNameDialogComponent,
  EditProjectNameDialogData
} from '../modules/project/project-settings/edit-project-name-dialog/edit-project-name-dialog.component';
import {
  AddEnvDialogComponent,
  AddEnvDialogData
} from '../modules/project/project-team/add-env-dialog/add-env-dialog.component';
import {
  AddRoleDialogComponent,
  AddRoleDialogData
} from '../modules/project/project-team/add-role-dialog/add-role-dialog.component';
import {
  InviteMemberDialogComponent,
  InviteMemberDialogData
} from '../modules/project/project-team/invite-member-dialog/invite-member-dialog.component';
import {
  RemoveMemberDialogComponent,
  RemoveMemberDialogData
} from '../modules/project/project-team/remove-member-dialog/remove-member-dialog.component';
import {
  ChartDialogComponent,
  ChartDialogData
} from '../modules/shared/chart-dialog/chart-dialog.component';
import {
  DeleteVizDialogComponent,
  DeleteVizDialogData
} from '../modules/shared/chart-viz/delete-viz-dialog/delete-viz-dialog.component';
import {
  EditVizInfoDialogComponent,
  EditVizInfoDialogData
} from '../modules/shared/chart-viz/edit-viz-info-dialog/edit-viz-info-dialog.component';
import {
  DeleteDashboardDialogComponent,
  DeleteDashboardDialogData
} from '../modules/shared/delete-dashboard-dialog/delete-dashboard-dialog.component';
import {
  PhotoDialogComponent,
  PhotoDialogData
} from '../modules/shared/photo-dialog/photo-dialog.component';
import { ErrorDialogComponent } from '../modules/special/error-dialog/error-dialog.component';
import {
  NewVizDialogComponent,
  NewVizDialogData
} from '../modules/visualizations/new-viz-dialog/new-viz-dialog.component';

export interface ErrorDialogData {
  errorData: interfaces.ErrorData;
  isThrow: boolean;
}

@Injectable({ providedIn: 'root' })
export class MyDialogService {
  constructor(private dialogService: DialogService) {}

  showError(item: ErrorDialogData): void {
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

  showPhoto(item: PhotoDialogData): void {
    this.dialogService.open(PhotoDialogComponent, {
      enableClose: false,
      closeButton: true,
      data: item
    });
  }

  showEditPhoto(item: EditPhotoDialogData): void {
    this.dialogService.open(EditPhotoDialogComponent, {
      enableClose: false,
      closeButton: false,
      data: item
    });
  }

  showEditName(item: EditNameDialogData): void {
    this.dialogService.open(EditNameDialogComponent, {
      enableClose: false,
      closeButton: false,
      data: item
    });
  }

  showEditTimezone(item: EditTimezoneDialogData): void {
    this.dialogService.open(EditTimezoneDialogComponent, {
      enableClose: false,
      closeButton: false,
      data: item
    });
  }

  showApiKey(): void {
    this.dialogService.open(ApiKeyDialogComponent, {
      enableClose: false,
      closeButton: true
    });
  }

  showDeleteUser(item: DeleteUserDialogData): void {
    this.dialogService.open(DeleteUserDialogComponent, {
      enableClose: false,
      closeButton: false,
      data: item
    });
  }

  showCreateOrg(item: CreateOrgDialogData): void {
    this.dialogService.open(CreateOrgDialogComponent, {
      enableClose: false,
      closeButton: false,
      data: item
    });
  }

  showCreateProject(item: CreateProjectDialogData): void {
    this.dialogService.open(CreateProjectDialogComponent, {
      enableClose: false,
      closeButton: false,
      data: item,
      width: 800
    });
  }

  showCreateBranch(item: CreateBranchDialogData): void {
    this.dialogService.open(CreateBranchDialogComponent, {
      enableClose: false,
      closeButton: false,
      data: item
    });
  }

  showViewBlockml(item: ViewBlockmlDialogData): void {
    this.dialogService.open(ViewBlockmlDialogComponent, {
      enableClose: false,
      closeButton: true,
      data: item,
      width: 1024
    });
  }

  showChart(item: ChartDialogData): void {
    this.dialogService.open(ChartDialogComponent, {
      enableClose: false,
      closeButton: true,
      data: item,
      width: '80vw',
      height: '80vh'
    });
  }

  showChartSaveAs(item: ChartSaveAsDialogData): void {
    this.dialogService.open(ChartSaveAsDialogComponent, {
      enableClose: false,
      closeButton: false,
      data: item,
      width: 900
    });
  }

  showDashboardSaveAs(item: DashboardSaveAsDialogData): void {
    this.dialogService.open(DashboardSaveAsDialogComponent, {
      enableClose: false,
      closeButton: false,
      data: item,
      width: 900
    });
  }

  showDashboardAddReport(item: DashboardAddReportDialogData): void {
    this.dialogService.open(DashboardAddReportDialogComponent, {
      enableClose: false,
      closeButton: true,
      data: item,
      width: 640
    });
  }

  showDashboardAddFilter(item: DashboardAddFilterDialogData): void {
    this.dialogService.open(DashboardAddFilterDialogComponent, {
      enableClose: false,
      closeButton: false,
      data: item,
      width: 640
    });
  }

  showDashboardEditListeners(item: DashboardEditListenersDialogData): void {
    this.dialogService.open(DashboardEditListenersDialogComponent, {
      enableClose: false,
      closeButton: false,
      data: item,
      width: '90vw',
      height: '80vh'
    });
  }

  showDashboardsNew(item: DashboardsNewDialogData): void {
    this.dialogService.open(DashboardsNewDialogComponent, {
      enableClose: false,
      closeButton: false,
      data: item,
      width: 800
    });
  }

  showEditVizInfo(item: EditVizInfoDialogData): void {
    this.dialogService.open(EditVizInfoDialogComponent, {
      enableClose: false,
      closeButton: false,
      data: item,
      width: 640
    });
  }

  showNewViz(item: NewVizDialogData): void {
    this.dialogService.open(NewVizDialogComponent, {
      enableClose: false,
      closeButton: true,
      data: item
    });
  }

  showDeleteViz(item: DeleteVizDialogData): void {
    this.dialogService.open(DeleteVizDialogComponent, {
      enableClose: false,
      closeButton: false,
      data: item
    });
  }

  showDeleteDashboard(item: DeleteDashboardDialogData): void {
    this.dialogService.open(DeleteDashboardDialogComponent, {
      enableClose: false,
      closeButton: false,
      data: item
    });
  }

  showMergeBranch(item: MergeBranchDialogData): void {
    this.dialogService.open(MergeBranchDialogComponent, {
      enableClose: false,
      closeButton: false,
      data: item
    });
  }

  showCommit(item: CommitDialogDialogData): void {
    this.dialogService.open(CommitDialogComponent, {
      enableClose: false,
      closeButton: false,
      data: item,
      width: 800
    });
  }

  showDeleteBranch(item: DeleteBranchDialogData): void {
    this.dialogService.open(DeleteBranchDialogComponent, {
      enableClose: false,
      closeButton: false,
      data: item,
      width: 900
    });
  }

  showEditOrgName(item: EditOrgNameDialogData): void {
    this.dialogService.open(EditOrgNameDialogComponent, {
      enableClose: false,
      closeButton: false,
      data: item
    });
  }

  showEditOrgOwner(item: EditOrgOwnerDialogData): void {
    this.dialogService.open(EditOrgOwnerDialogComponent, {
      enableClose: false,
      closeButton: false,
      data: item,
      width: 800
    });
  }

  showDeleteOrg(item: DeleteOrgDialogData): void {
    this.dialogService.open(DeleteOrgDialogComponent, {
      enableClose: false,
      closeButton: false,
      data: item
    });
  }

  showEditProjectName(item: EditProjectNameDialogData): void {
    this.dialogService.open(EditProjectNameDialogComponent, {
      enableClose: false,
      closeButton: false,
      data: item
    });
  }

  showDeleteProject(item: DeleteProjectDialogData): void {
    this.dialogService.open(DeleteProjectDialogComponent, {
      enableClose: false,
      closeButton: false,
      data: item
    });
  }

  showInviteMember(item: InviteMemberDialogData): void {
    this.dialogService.open(InviteMemberDialogComponent, {
      enableClose: false,
      closeButton: false,
      data: item
    });
  }

  showRemoveMember(item: RemoveMemberDialogData): void {
    this.dialogService.open(RemoveMemberDialogComponent, {
      enableClose: false,
      closeButton: false,
      data: item
    });
  }

  showAddRole(item: AddRoleDialogData): void {
    this.dialogService.open(AddRoleDialogComponent, {
      enableClose: false,
      closeButton: false,
      data: item
    });
  }

  showAddEnv(item: AddEnvDialogData): void {
    this.dialogService.open(AddEnvDialogComponent, {
      enableClose: false,
      closeButton: false,
      data: item
    });
  }

  showAddConnection(item: AddConnectionDialogData): void {
    this.dialogService.open(AddConnectionDialogComponent, {
      enableClose: false,
      closeButton: false,
      data: item
    });
  }

  showEditConnection(item: EditConnectionDialogData): void {
    this.dialogService.open(EditConnectionDialogComponent, {
      enableClose: false,
      closeButton: false,
      data: item
    });
  }

  showDeleteConnection(item: DeleteConnectionDialogData): void {
    this.dialogService.open(DeleteConnectionDialogComponent, {
      enableClose: false,
      closeButton: false,
      data: item
    });
  }

  showAddEnvironment(item: AddEnvironmentDialogData): void {
    this.dialogService.open(AddEnvironmentDialogComponent, {
      enableClose: false,
      closeButton: false,
      data: item
    });
  }

  showAddEv(item: AddEvDialogData): void {
    this.dialogService.open(AddEvDialogComponent, {
      enableClose: false,
      closeButton: false,
      data: item,
      width: 800
    });
  }

  showEditEv(item: EditEvDialogData): void {
    this.dialogService.open(EditEvDialogComponent, {
      enableClose: false,
      closeButton: false,
      data: item,
      width: 800
    });
  }

  showDeleteEv(item: DeleteEvDialogData): void {
    this.dialogService.open(DeleteEvDialogComponent, {
      enableClose: false,
      closeButton: false,
      data: item,
      width: 800
    });
  }

  showDeleteEnvironment(item: DeleteEnvironmentDialogData): void {
    this.dialogService.open(DeleteEnvironmentDialogComponent, {
      enableClose: false,
      closeButton: false,
      data: item
    });
  }

  showCreateFolder(item: CreateFolderDialogData): void {
    this.dialogService.open(CreateFolderDialogComponent, {
      enableClose: false,
      closeButton: false,
      data: item,
      width: 700
    });
  }

  showCreateFile(item: CreateFileDialogData): void {
    this.dialogService.open(CreateFileDialogComponent, {
      enableClose: false,
      closeButton: false,
      data: item,
      width: 700
    });
  }

  showDeleteFolder(item: DeleteFolderDialogData): void {
    this.dialogService.open(DeleteFolderDialogComponent, {
      enableClose: false,
      closeButton: false,
      data: item
    });
  }

  showRenameFolder(item: RenameFolderDialogData): void {
    this.dialogService.open(RenameFolderDialogComponent, {
      enableClose: false,
      closeButton: false,
      data: item,
      width: 700
    });
  }

  showRenameFile(item: RenameFileDialogData): void {
    this.dialogService.open(RenameFileDialogComponent, {
      enableClose: false,
      closeButton: false,
      data: item,
      width: 700
    });
  }

  showDeleteFile(item: DeleteFileDialogData): void {
    this.dialogService.open(DeleteFileDialogComponent, {
      enableClose: false,
      closeButton: false,
      data: item
    });
  }
}
