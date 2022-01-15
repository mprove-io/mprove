import { Injectable } from '@angular/core';
import { DialogService } from '@ngneat/dialog';
import { common } from '~front/barrels/common';
import { constants } from '~front/barrels/constants';
import { interfaces } from '~front/barrels/interfaces';
import { BranchItem } from '../interfaces/_index';
import { EmailConfirmedDialogComponent } from '../modules/auth/main/03-confirm-email/email-confirmed-dialog/email-confirmed-dialog.component';
import { DeleteFileDialogComponent } from '../modules/blockml/blockml-tree/file-options/delete-file-dialog/delete-file-dialog.component';
import { RenameFileDialogComponent } from '../modules/blockml/blockml-tree/file-options/rename-file-dialog/rename-file-dialog.component';
import { CreateFileDialogComponent } from '../modules/blockml/blockml-tree/folder-options/create-file-dialog/create-file-dialog.component';
import { CreateFolderDialogComponent } from '../modules/blockml/blockml-tree/folder-options/create-folder-dialog/create-folder-dialog.component';
import { DeleteFolderDialogComponent } from '../modules/blockml/blockml-tree/folder-options/delete-folder-dialog/delete-folder-dialog.component';
import { RenameFolderDialogComponent } from '../modules/blockml/blockml-tree/folder-options/rename-folder-dialog/rename-folder-dialog.component';
import { DashboardSaveAsDialogComponent } from '../modules/dashboard/dashboard-save-as-dialog/dashboard-save-as-dialog.component';
import { ChartSaveAsDialogComponent } from '../modules/model/chart-save-as-dialog/chart-save-as-dialog.component';
import { ViewBlockmlDialogComponent } from '../modules/model/view-blockml-dialog/view-blockml-dialog.component';
import { CreateBranchDialogComponent } from '../modules/navbar/branch-select/create-branch-dialog/create-branch-dialog.component';
import { DeleteBranchDialogComponent } from '../modules/navbar/branch-select/delete-branch-dialog/delete-branch-dialog.component';
import { MergeBranchDialogComponent } from '../modules/navbar/branch-select/merge-branch-dialog/merge-branch-dialog.component';
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
import { ChartDialogComponent } from '../modules/shared/chart-dialog/chart-dialog.component';
import { DeleteVizDialogComponent } from '../modules/shared/chart-viz/delete-viz-dialog/delete-viz-dialog.component';
import { EditVizInfoDialogComponent } from '../modules/shared/chart-viz/edit-viz-info-dialog/edit-viz-info-dialog.component';
import { PhotoDialogComponent } from '../modules/shared/photo-dialog/photo-dialog.component';
import { ErrorDialogComponent } from '../modules/special/error-dialog/error-dialog.component';
import { NewVizDialogComponent } from '../modules/visualizations/new-viz-dialog/new-viz-dialog.component';
import { RData } from './query.service';

@Injectable({ providedIn: 'root' })
export class MyDialogService {
  constructor(private dialogService: DialogService) {}

  showError(item: { errorData: interfaces.ErrorData; isThrow: boolean }): void {
    let { errorData, isThrow } = item;

    if (this.dialogService.dialogs.length < 2) {
      this.dialogService.open(ErrorDialogComponent, {
        enableClose: false,
        data: errorData,
        width: 650
      });
    }

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
    apiService: any;
    avatarBig: string;
    initials: string;
  }): void {
    this.dialogService.open(PhotoDialogComponent, {
      enableClose: true,
      closeButton: true,
      data: item
    });
  }

  showEditPhoto(item: { apiService: any }): void {
    this.dialogService.open(EditPhotoDialogComponent, {
      enableClose: false,
      data: item
    });
  }

  showEditName(item: { apiService: any }): void {
    this.dialogService.open(EditNameDialogComponent, {
      enableClose: false,
      data: item
    });
  }

  showEditTimezone(item: { apiService: any }): void {
    this.dialogService.open(EditTimezoneDialogComponent, {
      enableClose: false,
      data: item
    });
  }

  showDeleteUser(item: { apiService: any }): void {
    this.dialogService.open(DeleteUserDialogComponent, {
      enableClose: false,
      data: item
    });
  }

  showCreateOrg(item: { apiService: any }): void {
    this.dialogService.open(CreateOrgDialogComponent, {
      enableClose: false,
      data: item
    });
  }

  showCreateProject(item: { apiService: any; orgId: string }): void {
    this.dialogService.open(CreateProjectDialogComponent, {
      enableClose: false,
      data: item
    });
  }

  showCreateBranch(item: {
    apiService: any;
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

  showViewBlockml(item: { apiService: any; mconfig: common.Mconfig }): void {
    this.dialogService.open(ViewBlockmlDialogComponent, {
      enableClose: true,
      data: item,
      width: 1024
    });
  }

  showChart(item: {
    apiService: any;
    mconfig: common.Mconfig;
    query: common.Query;
    qData: RData[];
    sortedColumns: interfaces.ColumnField[];
    model: common.Model;
    canAccessModel: boolean;
    showNav: boolean;
    isSelectValid: boolean;
    vizId?: string;
    dashboardId?: string;
    updateQueryFn?: any;
  }): void {
    this.dialogService.open(ChartDialogComponent, {
      enableClose: true,
      data: item,
      width: '80vw',
      height: '80vh',
      closeButton: false
    });
  }

  showChartSaveAs(item: {
    apiService: any;
    projectId: string;
    isRepoProd: boolean;
    branchId: string;
    mconfig: common.Mconfig;
    model: common.Model;
  }): void {
    this.dialogService.open(ChartSaveAsDialogComponent, {
      enableClose: false,
      data: item,
      width: 640
    });
  }

  showDashboardSaveAs(item: {
    apiService: any;
    projectId: string;
    isRepoProd: boolean;
    branchId: string;
    dashboard: common.Dashboard;
  }): void {
    this.dialogService.open(DashboardSaveAsDialogComponent, {
      enableClose: false,
      data: item,
      width: 640
    });
  }

  showEditVizInfo(item: {
    apiService: any;
    projectId: string;
    isRepoProd: boolean;
    branchId: string;
    mconfig: common.Mconfig;
    viz: common.Viz;
  }): void {
    this.dialogService.open(EditVizInfoDialogComponent, {
      enableClose: false,
      data: item,
      width: 640
    });
  }

  showNewViz(item: { modelsList: common.ModelsItem[] }): void {
    this.dialogService.open(NewVizDialogComponent, {
      enableClose: true,
      data: item
    });
  }

  showDeleteViz(item: {
    apiService: any;
    vizDeletedFnBindThis: any;
    viz: common.Viz;
    projectId: string;
    branchId: string;
    isRepoProd: boolean;
  }): void {
    this.dialogService.open(DeleteVizDialogComponent, {
      enableClose: true,
      data: item
    });
  }

  showMergeBranch(item: {
    apiService: any;
    fileService: any;
    projectId: string;
    fileId: string;
    currentBranchId: string;
    currentBranchExtraName: string;
    branchesList: BranchItem[];
  }): void {
    this.dialogService.open(MergeBranchDialogComponent, {
      enableClose: false,
      data: item
    });
  }

  showDeleteBranch(item: {
    apiService: any;
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
    apiService: any;
    orgId: string;
    orgName: string;
  }): void {
    this.dialogService.open(EditOrgNameDialogComponent, {
      enableClose: false,
      data: item
    });
  }

  showEditOrgOwner(item: {
    apiService: any;
    orgId: string;
    ownerEmail: string;
  }): void {
    this.dialogService.open(EditOrgOwnerDialogComponent, {
      enableClose: false,
      data: item
    });
  }

  showEditCompanySize(item: {
    apiService: any;
    orgId: string;
    companySize: string;
  }): void {
    this.dialogService.open(EditCompanySizeDialogComponent, {
      enableClose: false,
      data: item
    });
  }

  showEditPhoneNumber(item: {
    apiService: any;
    orgId: string;
    contactPhone: string;
  }): void {
    this.dialogService.open(EditPhoneNumberDialogComponent, {
      enableClose: false,
      data: item
    });
  }

  showDeleteOrg(item: {
    apiService: any;
    orgId: string;
    orgName: string;
  }): void {
    this.dialogService.open(DeleteOrgDialogComponent, {
      enableClose: false,
      data: item
    });
  }

  showEditProjectName(item: {
    apiService: any;
    projectId: string;
    projectName: string;
  }): void {
    this.dialogService.open(EditProjectNameDialogComponent, {
      enableClose: false,
      data: item
    });
  }

  showDeleteProject(item: {
    apiService: any;
    projectId: string;
    projectName: string;
  }): void {
    this.dialogService.open(DeleteProjectDialogComponent, {
      enableClose: false,
      data: item
    });
  }

  showInviteMember(item: { apiService: any; projectId: string }): void {
    this.dialogService.open(InviteMemberDialogComponent, {
      enableClose: false,
      data: item
    });
  }

  showRemoveMember(item: {
    apiService: any;
    projectId: string;
    memberId: string;
    email: string;
  }): void {
    this.dialogService.open(RemoveMemberDialogComponent, {
      enableClose: false,
      data: item
    });
  }

  showAddRole(item: {
    apiService: any;
    member: common.Member;
    i: number;
  }): void {
    this.dialogService.open(AddRoleDialogComponent, {
      enableClose: false,
      data: item
    });
  }

  showAddConnection(item: { apiService: any; projectId: string }): void {
    this.dialogService.open(AddConnectionDialogComponent, {
      enableClose: false,
      data: item
    });
  }

  showDeleteConnection(item: {
    apiService: any;
    projectId: string;
    connectionId: string;
  }): void {
    this.dialogService.open(DeleteConnectionDialogComponent, {
      enableClose: false,
      data: item
    });
  }

  showEditConnection(item: {
    apiService: any;
    connection: common.Connection;
    i: number;
  }): void {
    this.dialogService.open(EditConnectionDialogComponent, {
      enableClose: false,
      data: item
    });
  }

  showCreateFolder(item: {
    apiService: any;
    projectId: string;
    branchId: string;
    parentNodeId: string;
  }): void {
    this.dialogService.open(CreateFolderDialogComponent, {
      enableClose: false,
      data: item
    });
  }

  showCreateFile(item: {
    apiService: any;
    projectId: string;
    branchId: string;
    parentNodeId: string;
  }): void {
    this.dialogService.open(CreateFileDialogComponent, {
      enableClose: false,
      data: item
    });
  }

  showDeleteFolder(item: {
    apiService: any;
    projectId: string;
    branchId: string;
    folderNodeId: string;
    folderName: string;
  }): void {
    this.dialogService.open(DeleteFolderDialogComponent, {
      enableClose: false,
      data: item
    });
  }

  showRenameFolder(item: {
    apiService: any;
    projectId: string;
    branchId: string;
    nodeId: string;
    folderName: string;
  }): void {
    this.dialogService.open(RenameFolderDialogComponent, {
      enableClose: false,
      data: item
    });
  }

  showRenameFile(item: {
    apiService: any;
    projectId: string;
    branchId: string;
    nodeId: string;
    fileName: string;
  }): void {
    this.dialogService.open(RenameFileDialogComponent, {
      enableClose: false,
      data: item
    });
  }

  showDeleteFile(item: {
    apiService: any;
    projectId: string;
    branchId: string;
    fileNodeId: string;
    fileName: string;
  }): void {
    this.dialogService.open(DeleteFileDialogComponent, {
      enableClose: false,
      data: item
    });
  }
}
