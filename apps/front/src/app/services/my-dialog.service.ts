import { Injectable } from '@angular/core';
import { DialogService } from '@ngneat/dialog';
import { SPECIAL_ERROR } from '#common/constants/top-front';
import { ErrorData } from '#common/interfaces/front/error-data';
import { EmailConfirmedDialogComponent } from '../modules/auth/main/03-confirm-email/email-confirmed-dialog/email-confirmed-dialog.component';
import {
  DeleteFileDialogComponent,
  DeleteFileDialogData
} from '../modules/builder/builder-left/file-options/delete-file-dialog/delete-file-dialog.component';
import {
  RenameFileDialogComponent,
  RenameFileDialogData
} from '../modules/builder/builder-left/file-options/rename-file-dialog/rename-file-dialog.component';
import {
  CreateFileDialogComponent,
  CreateFileDialogData
} from '../modules/builder/builder-left/folder-options/create-file-dialog/create-file-dialog.component';
import {
  CreateFolderDialogComponent,
  CreateFolderDialogData
} from '../modules/builder/builder-left/folder-options/create-folder-dialog/create-folder-dialog.component';
import {
  DeleteFolderDialogComponent,
  DeleteFolderDialogData
} from '../modules/builder/builder-left/folder-options/delete-folder-dialog/delete-folder-dialog.component';
import {
  NewFileDialogComponent,
  NewFileDialogData
} from '../modules/builder/builder-left/folder-options/new-file-dialog/new-file-dialog.component';
import {
  RenameFolderDialogComponent,
  RenameFolderDialogData
} from '../modules/builder/builder-left/folder-options/rename-folder-dialog/rename-folder-dialog.component';
import {
  CommitDialogComponent,
  CommitDialogDialogData
} from '../modules/builder/commit-dialog/commit-dialog.component';
import {
  MalloyModelsDialogComponent,
  MalloyModelsDialogData
} from '../modules/builder/malloy-models-dialog/malloy-models-dialog.component';
import {
  EditSessionTitleDialogComponent,
  EditSessionTitleDialogData
} from '../modules/builder/session/edit-session-title-dialog/edit-session-title-dialog.component';
import {
  CreateDashboardDialogComponent,
  CreateDashboardDialogData
} from '../modules/dashboards/create-dashboard-dialog/create-dashboard-dialog.component';
import {
  DashboardAddFilterDialogComponent,
  DashboardAddFilterDialogData
} from '../modules/dashboards/dashboard-add-filter-dialog/dashboard-add-filter-dialog.component';
import {
  DashboardAddTileDialogComponent,
  DashboardAddTileDialogData
} from '../modules/dashboards/dashboard-add-tile-dialog/dashboard-add-tile-dialog.component';
import {
  ChartsAddColumnFieldDialogComponent,
  ChartsAddColumnFieldDialogData
} from '../modules/models/charts-add-column-field-dialog/charts-add-column-field-dialog.component';
import {
  ChartsAddFilterDialogComponent,
  ChartsAddFilterDialogData
} from '../modules/models/charts-add-filter-dialog/charts-add-filter-dialog.component';
import {
  ChartsReplaceColumnFieldDialogComponent,
  ChartsReplaceColumnFieldDialogData
} from '../modules/models/charts-replace-column-field-dialog/charts-replace-column-field-dialog.component';
import {
  CreateModelDialogComponent,
  CreateModelDialogData
} from '../modules/models/create-model-dialog/create-model-dialog.component';
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
  AddEnvUserDialogComponent,
  AddEnvUserDialogData
} from '../modules/project/project-environments/add-env-user-dialog/add-env-user-dialog.component';
import {
  AddEnvironmentDialogComponent,
  AddEnvironmentDialogData
} from '../modules/project/project-environments/add-environment-dialog/add-environment-dialog.component';
import {
  AddEvDialogComponent,
  AddEvDialogData
} from '../modules/project/project-environments/add-ev-dialog/add-ev-dialog.component';
import {
  DeleteEnvironmentDialogComponent,
  DeleteEnvironmentDialogData
} from '../modules/project/project-environments/delete-environment-dialog/delete-environment-dialog.component';
import {
  DeleteEvDialogComponent,
  DeleteEvDialogData
} from '../modules/project/project-environments/delete-ev-dialog/delete-ev-dialog.component';
import {
  EditEvDialogComponent,
  EditEvDialogData
} from '../modules/project/project-environments/edit-ev-dialog/edit-ev-dialog.component';
import {
  DeleteProjectDialogComponent,
  DeleteProjectDialogData
} from '../modules/project/project-info/delete-project-dialog/delete-project-dialog.component';
import {
  EditApiKeyDialogComponent,
  EditApiKeyDialogData
} from '../modules/project/project-info/edit-api-key-dialog/edit-api-key-dialog.component';
import {
  EditProjectNameDialogComponent,
  EditProjectNameDialogData
} from '../modules/project/project-info/edit-project-name-dialog/edit-project-name-dialog.component';
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
  DeleteReportDialogComponent,
  DeleteReportDialogData
} from '../modules/reports/delete-report-dialog/delete-report-dialog.component';
import {
  ReportAddFilterDialogComponent,
  ReportAddFilterDialogData
} from '../modules/reports/report-add-filter-dialog/report-add-filter-dialog.component';
import {
  ReportAddRowDialogComponent,
  ReportAddRowDialogData
} from '../modules/reports/report-add-row-dialog/report-add-row-dialog.component';
import {
  RowAddFilterDialogComponent,
  RowAddFilterDialogData
} from '../modules/reports/row-add-filter-dialog/row-add-filter-dialog.component';
import {
  ChartDialogComponent,
  ChartDialogData
} from '../modules/shared/chart-dialog/chart-dialog.component';
import {
  ChartFormulaDialogComponent,
  ChartFormulaDialogData
} from '../modules/shared/chart-formula-dialog/chart-formula-dialog.component';
import {
  ChartSaveAsDialogComponent,
  ChartSaveAsDialogData
} from '../modules/shared/chart-save-as-dialog/chart-save-as-dialog.component';
import {
  DashboardEditListenersDialogComponent,
  DashboardEditListenersDialogData
} from '../modules/shared/dashboard-edit-listeners-dialog/dashboard-edit-listeners-dialog.component';
import {
  DashboardSaveAsDialogComponent,
  DashboardSaveAsDialogData
} from '../modules/shared/dashboard-save-as-dialog/dashboard-save-as-dialog.component';
import {
  DeleteChartDialogComponent,
  DeleteChartDialogData
} from '../modules/shared/delete-chart-dialog/delete-chart-dialog.component';
import {
  DeleteDashboardDialogComponent,
  DeleteDashboardDialogData
} from '../modules/shared/delete-dashboard-dialog/delete-dashboard-dialog.component';
import {
  EditChartInfoDialogComponent,
  EditChartInfoDialogData
} from '../modules/shared/edit-chart-info-dialog/edit-chart-info-dialog.component';
import {
  EditDashboardInfoDialogComponent,
  EditDashboardInfoDialogData
} from '../modules/shared/edit-dashboard-info-dialog/edit-dashboard-info-dialog.component';
import {
  EditReportInfoDialogComponent,
  EditReportInfoDialogData
} from '../modules/shared/edit-report-info-dialog/edit-report-info-dialog.component';
import {
  PhotoDialogComponent,
  PhotoDialogData
} from '../modules/shared/photo-dialog/photo-dialog.component';
import {
  ReportEditListenersDialogComponent,
  ReportEditListenersDialogData
} from '../modules/shared/report-edit-listeners-dialog/report-edit-listeners-dialog.component';
import {
  ReportSaveAsDialogComponent,
  ReportSaveAsDialogData
} from '../modules/shared/report-save-as-dialog/report-save-as-dialog.component';
import { ErrorDialogComponent } from '../modules/special/error-dialog/error-dialog.component';

export interface ErrorDialogData {
  errorData: ErrorData;
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
      throw new Error(SPECIAL_ERROR);
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
      data: item,
      width: 200,
      height: 200
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

  showChart(item: ChartDialogData): void {
    this.dialogService.open(ChartDialogComponent, {
      enableClose: false,
      closeButton: true,
      data: item,
      width: '66vw',
      height: item.showNav === true ? '87vh' : '77vh'
    });
  }

  showChartAddFilter(item: ChartsAddFilterDialogData): void {
    this.dialogService.open(ChartsAddFilterDialogComponent, {
      enableClose: false,
      closeButton: false,
      data: item,
      width: 900
    });
  }

  showRowAddFilter(item: RowAddFilterDialogData): void {
    this.dialogService.open(RowAddFilterDialogComponent, {
      enableClose: false,
      closeButton: false,
      data: item,
      width: 900
    });
  }

  showAddColumnField(item: ChartsAddColumnFieldDialogData): void {
    this.dialogService.open(ChartsAddColumnFieldDialogComponent, {
      enableClose: false,
      closeButton: false,
      data: item,
      width: 900
    });
  }

  showReplaceColumnField(item: ChartsReplaceColumnFieldDialogData): void {
    this.dialogService.open(ChartsReplaceColumnFieldDialogComponent, {
      enableClose: false,
      closeButton: false,
      data: item,
      width: 900
    });
  }

  showChartFormula(item: ChartFormulaDialogData): void {
    this.dialogService.open(ChartFormulaDialogComponent, {
      enableClose: false,
      closeButton: true,
      data: item,
      width: '66vw',
      height: '60vh'
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

  showReportSaveAs(item: ReportSaveAsDialogData): void {
    this.dialogService.open(ReportSaveAsDialogComponent, {
      enableClose: false,
      closeButton: false,
      data: item,
      width: 900
    });
  }

  showReportAddRow(item: ReportAddRowDialogData): void {
    this.dialogService.open(ReportAddRowDialogComponent, {
      enableClose: false,
      closeButton: false,
      data: item,
      width: 1024
    });
  }

  showMalloyModels(item: MalloyModelsDialogData): void {
    this.dialogService.open(MalloyModelsDialogComponent, {
      enableClose: false,
      closeButton: true,
      data: item,
      width: 640
    });
  }

  showDashboardAddTile(item: DashboardAddTileDialogData): void {
    this.dialogService.open(DashboardAddTileDialogComponent, {
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
      width: 1024
    });
  }

  showReportAddFilter(item: ReportAddFilterDialogData): void {
    this.dialogService.open(ReportAddFilterDialogComponent, {
      enableClose: false,
      closeButton: false,
      data: item,
      width: 1024
    });
  }

  showDashboardEditListeners(item: DashboardEditListenersDialogData): void {
    this.dialogService.open(DashboardEditListenersDialogComponent, {
      enableClose: false,
      closeButton: false,
      data: item,
      width: '90vw',
      height: '87vh'
    });
  }

  showReportEditListeners(item: ReportEditListenersDialogData): void {
    this.dialogService.open(ReportEditListenersDialogComponent, {
      enableClose: false,
      closeButton: false,
      data: item,
      width: '90vw',
      height: '87vh'
    });
  }

  shoCreateDashboard(item: CreateDashboardDialogData): void {
    this.dialogService.open(CreateDashboardDialogComponent, {
      enableClose: false,
      closeButton: false,
      data: item,
      width: 800
    });
  }

  showEditChartInfo(item: EditChartInfoDialogData): void {
    this.dialogService.open(EditChartInfoDialogComponent, {
      enableClose: false,
      closeButton: false,
      data: item,
      width: 640
    });
  }

  showEditReportInfo(item: EditReportInfoDialogData): void {
    this.dialogService.open(EditReportInfoDialogComponent, {
      enableClose: false,
      closeButton: false,
      data: item,
      width: 640
    });
  }

  showEditDashboardInfo(item: EditDashboardInfoDialogData): void {
    this.dialogService.open(EditDashboardInfoDialogComponent, {
      enableClose: false,
      closeButton: false,
      data: item,
      width: 640
    });
  }

  showDeleteChart(item: DeleteChartDialogData): void {
    this.dialogService.open(DeleteChartDialogComponent, {
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

  showDeleteReport(item: DeleteReportDialogData): void {
    this.dialogService.open(DeleteReportDialogComponent, {
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

  showEditApiKey(item: EditApiKeyDialogData): void {
    this.dialogService.open(EditApiKeyDialogComponent, {
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

  showAddConnection(item: AddConnectionDialogData): void {
    this.dialogService.open(AddConnectionDialogComponent, {
      enableClose: false,
      closeButton: false,
      data: item,
      width: 800
    });
  }

  showEditConnection(item: EditConnectionDialogData): void {
    this.dialogService.open(EditConnectionDialogComponent, {
      enableClose: false,
      closeButton: false,
      data: item,
      width: 800
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

  showAddEnvUser(item: AddEnvUserDialogData): void {
    this.dialogService.open(AddEnvUserDialogComponent, {
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

  showNewFile(item: NewFileDialogData): void {
    this.dialogService.open(NewFileDialogComponent, {
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

  showCreateModel(item: CreateModelDialogData): void {
    this.dialogService.open(CreateModelDialogComponent, {
      enableClose: false,
      closeButton: false,
      data: item,
      width: 800
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

  showEditSessionTitle(item: EditSessionTitleDialogData): void {
    this.dialogService.open(EditSessionTitleDialogComponent, {
      enableClose: false,
      closeButton: false,
      data: item,
      width: 720
    });
  }
}
