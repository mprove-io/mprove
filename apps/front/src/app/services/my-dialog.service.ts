import { EventEmitter, Injectable } from '@angular/core';
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
import { PhotoDialogComponent } from '../modules/shared/photo-dialog/photo-dialog.component';
import { ErrorDialogComponent } from '../modules/special/error-dialog/error-dialog.component';
import { DeleteVizDialogComponent } from '../modules/visualizations/delete-viz-dialog/delete-viz-dialog.component';
import { ColumnField } from '../queries/mq.query';
import { ApiService } from './api.service';
import { FileService } from './file.service';
import { RData } from './query.service';

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
      data: item
    });
  }

  showEditPhoto(item: { apiService: ApiService }): void {
    this.dialogService.open(EditPhotoDialogComponent, {
      enableClose: false,
      data: item
    });
  }

  showEditName(item: { apiService: ApiService }): void {
    this.dialogService.open(EditNameDialogComponent, {
      enableClose: false,
      data: item
    });
  }

  showEditTimezone(item: { apiService: ApiService }): void {
    this.dialogService.open(EditTimezoneDialogComponent, {
      enableClose: false,
      data: item
    });
  }

  showDeleteUser(item: { apiService: ApiService }): void {
    this.dialogService.open(DeleteUserDialogComponent, {
      enableClose: false,
      data: item
    });
  }

  showCreateOrg(item: { apiService: ApiService }): void {
    this.dialogService.open(CreateOrgDialogComponent, {
      enableClose: false,
      data: item
    });
  }

  showCreateProject(item: { apiService: ApiService; orgId: string }): void {
    this.dialogService.open(CreateProjectDialogComponent, {
      enableClose: false,
      data: item
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

  showViewBlockml(item: {
    apiService: ApiService;
    mconfig: common.Mconfig;
  }): void {
    this.dialogService.open(ViewBlockmlDialogComponent, {
      enableClose: true,
      data: item,
      width: 1024
    });
  }

  showChart(item: {
    mconfig: common.Mconfig;
    query: common.Query;
    qData: RData[];
    sortedColumns: ColumnField[];
  }): void {
    this.dialogService.open(ChartDialogComponent, {
      enableClose: true,
      data: item,
      width: '80vw',
      height: '80vh'
    });
  }

  showChartSaveAs(item: {
    apiService: ApiService;
    projectId: string;
    isRepoProd: boolean;
    branchId: string;
    mconfig: common.Mconfig;
  }): void {
    this.dialogService.open(ChartSaveAsDialogComponent, {
      enableClose: false,
      data: item,
      width: 640
    });
  }

  showDeleteViz(item: {
    apiService: ApiService;
    vizDeleted: EventEmitter<string>;
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
    apiService: ApiService;
    fileService: FileService;
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
      data: item
    });
  }

  showEditOrgOwner(item: {
    apiService: ApiService;
    orgId: string;
    ownerEmail: string;
  }): void {
    this.dialogService.open(EditOrgOwnerDialogComponent, {
      enableClose: false,
      data: item
    });
  }

  showEditCompanySize(item: {
    apiService: ApiService;
    orgId: string;
    companySize: string;
  }): void {
    this.dialogService.open(EditCompanySizeDialogComponent, {
      enableClose: false,
      data: item
    });
  }

  showEditPhoneNumber(item: {
    apiService: ApiService;
    orgId: string;
    contactPhone: string;
  }): void {
    this.dialogService.open(EditPhoneNumberDialogComponent, {
      enableClose: false,
      data: item
    });
  }

  showDeleteOrg(item: {
    apiService: ApiService;
    orgId: string;
    orgName: string;
  }): void {
    this.dialogService.open(DeleteOrgDialogComponent, {
      enableClose: false,
      data: item
    });
  }

  showEditProjectName(item: {
    apiService: ApiService;
    projectId: string;
    projectName: string;
  }): void {
    this.dialogService.open(EditProjectNameDialogComponent, {
      enableClose: false,
      data: item
    });
  }

  showDeleteProject(item: {
    apiService: ApiService;
    projectId: string;
    projectName: string;
  }): void {
    this.dialogService.open(DeleteProjectDialogComponent, {
      enableClose: false,
      data: item
    });
  }

  showInviteMember(item: { apiService: ApiService; projectId: string }): void {
    this.dialogService.open(InviteMemberDialogComponent, {
      enableClose: false,
      data: item
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
      data: item
    });
  }

  showAddRole(item: {
    apiService: ApiService;
    member: common.Member;
    i: number;
  }): void {
    this.dialogService.open(AddRoleDialogComponent, {
      enableClose: false,
      data: item
    });
  }

  showAddConnection(item: { apiService: ApiService; projectId: string }): void {
    this.dialogService.open(AddConnectionDialogComponent, {
      enableClose: false,
      data: item
    });
  }

  showDeleteConnection(item: {
    apiService: ApiService;
    projectId: string;
    connectionId: string;
  }): void {
    this.dialogService.open(DeleteConnectionDialogComponent, {
      enableClose: false,
      data: item
    });
  }

  showEditConnection(item: {
    apiService: ApiService;
    connection: common.Connection;
    i: number;
  }): void {
    this.dialogService.open(EditConnectionDialogComponent, {
      enableClose: false,
      data: item
    });
  }

  showCreateFolder(item: {
    apiService: ApiService;
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
    apiService: ApiService;
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
    apiService: ApiService;
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
    apiService: ApiService;
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
    apiService: ApiService;
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
    apiService: ApiService;
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
