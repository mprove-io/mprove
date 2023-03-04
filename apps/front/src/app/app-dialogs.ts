import { EmailConfirmedDialogComponent } from './modules/auth/main/03-confirm-email/email-confirmed-dialog/email-confirmed-dialog.component';
import { DashboardAddFilterDialogComponent } from './modules/dashboard/dashboard-add-filter-dialog/dashboard-add-filter-dialog.component';
import { DashboardAddReportDialogComponent } from './modules/dashboard/dashboard-add-report-dialog/dashboard-add-report-dialog.component';
import { DashboardEditListenersDialogComponent } from './modules/dashboard/dashboard-edit-listeners-dialog/dashboard-edit-listeners-dialog.component';
import { DashboardSaveAsDialogComponent } from './modules/dashboard/dashboard-save-as-dialog/dashboard-save-as-dialog.component';
import { DashboardsNewDialogComponent } from './modules/dashboards/dashboards-new-dialog/dashboards-new-dialog.component';
import { CommitDialogComponent } from './modules/files/commit-dialog/commit-dialog.component';
import { DeleteFileDialogComponent } from './modules/files/files-tree/file-options/delete-file-dialog/delete-file-dialog.component';
import { RenameFileDialogComponent } from './modules/files/files-tree/file-options/rename-file-dialog/rename-file-dialog.component';
import { CreateFileDialogComponent } from './modules/files/files-tree/folder-options/create-file-dialog/create-file-dialog.component';
import { CreateFolderDialogComponent } from './modules/files/files-tree/folder-options/create-folder-dialog/create-folder-dialog.component';
import { DeleteFolderDialogComponent } from './modules/files/files-tree/folder-options/delete-folder-dialog/delete-folder-dialog.component';
import { RenameFolderDialogComponent } from './modules/files/files-tree/folder-options/rename-folder-dialog/rename-folder-dialog.component';
import { DeleteRepDialogComponent } from './modules/metrics/delete-rep-dialog/delete-rep-dialog.component';
import { RepSaveAsDialogComponent } from './modules/metrics/rep-save-as-dialog/rep-save-as-dialog.component';
import { ChartSaveAsDialogComponent } from './modules/model/chart-save-as-dialog/chart-save-as-dialog.component';
import { ViewBlockmlDialogComponent } from './modules/model/view-blockml-dialog/view-blockml-dialog.component';
import { CreateBranchDialogComponent } from './modules/navbar/branch-select/create-branch-dialog/create-branch-dialog.component';
import { DeleteBranchDialogComponent } from './modules/navbar/branch-select/delete-branch-dialog/delete-branch-dialog.component';
import { MergeBranchDialogComponent } from './modules/navbar/branch-select/merge-branch-dialog/merge-branch-dialog.component';
import { CreateOrgDialogComponent } from './modules/navbar/org-select/create-org-dialog/create-org-dialog.component';
import { CreateProjectDialogComponent } from './modules/navbar/project-select/create-project-dialog/create-project-dialog.component';
import { DeleteOrgDialogComponent } from './modules/org/org-account/delete-org-dialog/delete-org-dialog.component';
import { EditOrgNameDialogComponent } from './modules/org/org-account/edit-org-name-dialog/edit-org-name-dialog.component';
import { EditOrgOwnerDialogComponent } from './modules/org/org-account/edit-org-owner-dialog/edit-org-owner-dialog.component';
import { ApiKeyDialogComponent } from './modules/profile/api-key-dialog/api-key-dialog.component';
import { DeleteUserDialogComponent } from './modules/profile/delete-user-dialog/delete-user-dialog.component';
import { EditNameDialogComponent } from './modules/profile/edit-name-dialog/edit-name-dialog.component';
import { EditPhotoDialogComponent } from './modules/profile/edit-photo-dialog/edit-photo-dialog.component';
import { EditUserTimezoneDialogComponent } from './modules/profile/edit-user-timezone-dialog/edit-user-timezone-dialog.component';
import { AddConnectionDialogComponent } from './modules/project/project-connections/add-connection-dialog/add-connection-dialog.component';
import { DeleteConnectionDialogComponent } from './modules/project/project-connections/delete-connection-dialog/delete-connection-dialog.component';
import { EditConnectionDialogComponent } from './modules/project/project-connections/edit-connection-dialog/edit-connection-dialog.component';
import { AddEnvironmentDialogComponent } from './modules/project/project-environments/add-environment-dialog/add-environment-dialog.component';
import { DeleteEnvironmentDialogComponent } from './modules/project/project-environments/delete-environment-dialog/delete-environment-dialog.component';
import { AddEvDialogComponent } from './modules/project/project-evs/add-ev-dialog/add-ev-dialog.component';
import { DeleteEvDialogComponent } from './modules/project/project-evs/delete-ev-dialog/delete-ev-dialog.component';
import { EditEvDialogComponent } from './modules/project/project-evs/edit-ev-dialog/edit-ev-dialog.component';
import { EditProjectNameDialogComponent } from './modules/project/project-settings/edit-project-name-dialog/edit-project-name-dialog.component';
import { AddEnvDialogComponent } from './modules/project/project-team/add-env-dialog/add-env-dialog.component';
import { AddRoleDialogComponent } from './modules/project/project-team/add-role-dialog/add-role-dialog.component';
import { InviteMemberDialogComponent } from './modules/project/project-team/invite-member-dialog/invite-member-dialog.component';
import { ChartDialogComponent } from './modules/shared/chart-dialog/chart-dialog.component';
import { DeleteVizDialogComponent } from './modules/shared/chart-viz/delete-viz-dialog/delete-viz-dialog.component';
import { EditVizInfoDialogComponent } from './modules/shared/chart-viz/edit-viz-info-dialog/edit-viz-info-dialog.component';
import { DeleteDashboardDialogComponent } from './modules/shared/delete-dashboard-dialog/delete-dashboard-dialog.component';
import { PhotoDialogComponent } from './modules/shared/photo-dialog/photo-dialog.component';
import { ErrorDialogComponent } from './modules/special/error-dialog/error-dialog.component';
import { NewVizDialogComponent } from './modules/visualizations/new-viz-dialog/new-viz-dialog.component';

export const appDialogs = [
  ErrorDialogComponent,
  EmailConfirmedDialogComponent,
  PhotoDialogComponent,
  // navbar
  CreateOrgDialogComponent,
  CreateProjectDialogComponent,
  CreateBranchDialogComponent,
  DeleteBranchDialogComponent,
  // profile
  EditPhotoDialogComponent,
  EditNameDialogComponent,
  EditUserTimezoneDialogComponent,
  DeleteUserDialogComponent,
  ApiKeyDialogComponent,
  // org-account
  EditOrgNameDialogComponent,
  DeleteOrgDialogComponent,
  EditOrgOwnerDialogComponent,
  // project
  EditProjectNameDialogComponent,
  // project team
  InviteMemberDialogComponent,
  AddRoleDialogComponent,
  AddEnvDialogComponent,
  // project envrironments
  AddEnvironmentDialogComponent,
  DeleteEnvironmentDialogComponent,
  // project environment variables
  AddEvDialogComponent,
  EditEvDialogComponent,
  DeleteEvDialogComponent,
  // project connections
  AddConnectionDialogComponent,
  DeleteConnectionDialogComponent,
  EditConnectionDialogComponent,
  // files tree - folder options
  CreateFolderDialogComponent,
  CreateFileDialogComponent,
  DeleteFolderDialogComponent,
  RenameFolderDialogComponent,
  // files tree - file options
  DeleteFileDialogComponent,
  RenameFileDialogComponent,
  // files
  MergeBranchDialogComponent,
  CommitDialogComponent,
  // metrics
  RepSaveAsDialogComponent,
  DeleteRepDialogComponent,
  // model
  ViewBlockmlDialogComponent,
  ChartSaveAsDialogComponent,
  // visualizations
  DeleteVizDialogComponent,
  NewVizDialogComponent,
  EditVizInfoDialogComponent,
  // dashboard
  DashboardSaveAsDialogComponent,
  DashboardAddReportDialogComponent,
  DashboardAddFilterDialogComponent,
  DashboardEditListenersDialogComponent,
  // dashboards
  DashboardsNewDialogComponent,
  // shared
  ChartDialogComponent,
  DeleteDashboardDialogComponent
];
