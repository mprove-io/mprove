import { Injectable, Injector } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';
import * as api from '@app/api/_index';
import * as dialogs from '@app/dialogs/_index';

@Injectable()
export class MyDialogService {
  infoDialogRef: MatDialogRef<dialogs.InfoDialogComponent>;
  erDialogRef: MatDialogRef<dialogs.ErDialogComponent>;
  bqDialogRef: MatDialogRef<dialogs.BqDialogComponent>;
  reqDimAddedDialogRef: MatDialogRef<dialogs.ReqDimAddedDialogComponent>;
  depCalcRemovedDialogRef: MatDialogRef<dialogs.DepCalcRemovedDialogComponent>;
  pdtSqlDialogRef: MatDialogRef<dialogs.SqlDialogComponent>;
  newProjectDialogRef: MatDialogRef<dialogs.NewProjectDialogComponent>;
  resetPasswordDialogRef: MatDialogRef<dialogs.ResetPasswordDialogComponent>;
  updateRemoteUrlDialogRef: MatDialogRef<
    dialogs.UpdateRemoteUrlDialogComponent
  >;
  updateCredentialsDialogRef: MatDialogRef<
    dialogs.UpdateCredentialsDialogComponent
  >;
  deleteProjectDialogRef: MatDialogRef<dialogs.DeleteProjectDialogComponent>;
  deleteUserDialogRef: MatDialogRef<dialogs.DeleteUserDialogComponent>;
  inviteMemberDialogRef: MatDialogRef<dialogs.InviteMemberDialogComponent>;

  newFolderDialogRef: MatDialogRef<dialogs.NewFolderDialogComponent>;
  renameFolderDialogRef: MatDialogRef<dialogs.RenameFolderDialogComponent>;
  deleteFolderDialogRef: MatDialogRef<dialogs.DeleteFolderDialogComponent>;
  newFileDialogRef: MatDialogRef<dialogs.NewFileDialogComponent>;
  deleteFileDialogRef: MatDialogRef<dialogs.DeleteFileDialogComponent>;
  generateBlockmlDialogRef: MatDialogRef<
    dialogs.GenerateBlockmlDialogComponent
  >;
  showBigPictureDialogRef: MatDialogRef<dialogs.MemberPictureDialogComponent>;
  accessDeniedDialogRef: MatDialogRef<dialogs.AccessDeniedDialogComponent>;

  dialog: MatDialog = this.injector.get<MatDialog>(MatDialog);

  constructor(private injector: Injector) {}

  showReqDimAddedDialog(label: string) {
    this.reqDimAddedDialogRef = this.dialog.open(
      dialogs.ReqDimAddedDialogComponent,
      {
        disableClose: true,
        autoFocus: false,
        data: { label: label }
      }
    );

    this.reqDimAddedDialogRef.afterClosed().subscribe(() => {
      this.reqDimAddedDialogRef = null;
    });
  }

  showDepCalcRemovedDialog(label: string, from: string) {
    this.depCalcRemovedDialogRef = this.dialog.open(
      dialogs.DepCalcRemovedDialogComponent,
      {
        disableClose: true,
        autoFocus: false,
        data: { label: label, from: from }
      }
    );

    this.depCalcRemovedDialogRef.afterClosed().subscribe(() => {
      this.depCalcRemovedDialogRef = null;
    });
  }

  showSqlDialog(item: { name: string; sql: string }) {
    this.pdtSqlDialogRef = this.dialog.open(dialogs.SqlDialogComponent, {
      disableClose: false,
      autoFocus: false,
      data: {
        name: item.name,
        sql: item.sql
      }
    });

    this.pdtSqlDialogRef.afterClosed().subscribe(() => {
      this.pdtSqlDialogRef = null;
    });
  }

  showBqDialog() {
    this.bqDialogRef = this.dialog.open(dialogs.BqDialogComponent, {
      disableClose: false,
      autoFocus: false
    });

    this.bqDialogRef.afterClosed().subscribe(() => {
      this.bqDialogRef = null;
    });
  }

  showErDialog(data: any) {
    this.erDialogRef = this.dialog.open(dialogs.ErDialogComponent, {
      disableClose: true,
      autoFocus: false,
      data: data
    });

    this.erDialogRef.afterClosed().subscribe(() => {
      this.erDialogRef = null;
    });
  }

  showInfoDialog(info: string) {
    this.infoDialogRef = this.dialog.open(dialogs.InfoDialogComponent, {
      disableClose: true,
      autoFocus: false,
      data: {
        info: info
      }
    });

    this.infoDialogRef.afterClosed().subscribe(() => {
      this.infoDialogRef = null;
    });
  }

  showNewProjectDialog() {
    this.newProjectDialogRef = this.dialog.open(
      dialogs.NewProjectDialogComponent,
      {
        disableClose: false,
        autoFocus: false
      }
    );

    this.newProjectDialogRef.afterClosed().subscribe(() => {
      this.newProjectDialogRef = null;
    });
  }

  showUpdateRemoteUrlDialog() {
    this.updateRemoteUrlDialogRef = this.dialog.open(
      dialogs.UpdateRemoteUrlDialogComponent,
      {
        disableClose: false,
        autoFocus: false
      }
    );

    this.updateRemoteUrlDialogRef.afterClosed().subscribe(() => {
      this.updateRemoteUrlDialogRef = null;
    });
  }

  showUpdateCredentialsDialog() {
    // setTimeout(
    //   () => {
    //     if (Math.random() > 0.00001) {
    //       throw new Error('Boom!');
    //     }
    //   },
    //   1);

    // if (Math.random() > 0.00001) {
    //   throw new Error('Boom!');
    // }

    this.updateCredentialsDialogRef = this.dialog.open(
      dialogs.UpdateCredentialsDialogComponent,
      {
        disableClose: false,
        autoFocus: false
      }
    );

    this.updateCredentialsDialogRef.afterClosed().subscribe(() => {
      this.updateCredentialsDialogRef = null;
    });
  }

  showDeleteProjectDialog() {
    this.deleteProjectDialogRef = this.dialog.open(
      dialogs.DeleteProjectDialogComponent,
      {
        disableClose: false,
        autoFocus: false
      }
    );

    this.deleteProjectDialogRef.afterClosed().subscribe(() => {
      this.deleteProjectDialogRef = null;
    });
  }

  showDeleteUserDialog() {
    this.deleteUserDialogRef = this.dialog.open(
      dialogs.DeleteUserDialogComponent,
      {
        disableClose: false,
        autoFocus: false
      }
    );

    this.deleteUserDialogRef.afterClosed().subscribe(() => {
      this.deleteUserDialogRef = null;
    });
  }

  showResetPasswordDialog() {
    this.resetPasswordDialogRef = this.dialog.open(
      dialogs.ResetPasswordDialogComponent,
      {
        disableClose: false,
        autoFocus: false
      }
    );

    this.resetPasswordDialogRef.afterClosed().subscribe(() => {
      this.resetPasswordDialogRef = null;
    });
  }

  showInviteMemberDialog() {
    this.inviteMemberDialogRef = this.dialog.open(
      dialogs.InviteMemberDialogComponent,
      {
        disableClose: false,
        autoFocus: false
      }
    );

    this.inviteMemberDialogRef.afterClosed().subscribe(() => {
      this.inviteMemberDialogRef = null;
    });
  }

  showNewFolderDialog(data: { node_id: string }) {
    this.newFolderDialogRef = this.dialog.open(
      dialogs.NewFolderDialogComponent,
      {
        disableClose: false,
        autoFocus: false,
        data: data
      }
    );

    this.newFolderDialogRef.afterClosed().subscribe(() => {
      this.newFolderDialogRef = null;
    });
  }

  showNewFileDialog(data: { node_id: string }) {
    this.newFileDialogRef = this.dialog.open(dialogs.NewFileDialogComponent, {
      disableClose: false,
      autoFocus: false,
      data: data
    });

    this.newFileDialogRef.afterClosed().subscribe(() => {
      this.newFileDialogRef = null;
    });
  }

  showRenameFolderDialog(data: { node_id: string }) {
    this.renameFolderDialogRef = this.dialog.open(
      dialogs.RenameFolderDialogComponent,
      {
        disableClose: false,
        autoFocus: false,
        data: data
      }
    );

    this.renameFolderDialogRef.afterClosed().subscribe(() => {
      this.renameFolderDialogRef = null;
    });
  }

  showDeleteFolderDialog(data: { node_id: string }) {
    this.deleteFolderDialogRef = this.dialog.open(
      dialogs.DeleteFolderDialogComponent,
      {
        disableClose: false,
        autoFocus: false,
        data: data
      }
    );

    this.deleteFolderDialogRef.afterClosed().subscribe(() => {
      this.deleteFolderDialogRef = null;
    });
  }

  showDeleteFileDialog(data: { file: api.CatalogFile }) {
    this.deleteFileDialogRef = this.dialog.open(
      dialogs.DeleteFileDialogComponent,
      {
        disableClose: false,
        autoFocus: false,
        data: data
      }
    );

    this.deleteFileDialogRef.afterClosed().subscribe(() => {
      this.deleteFileDialogRef = null;
    });
  }

  showGenerateBlockmlDialog() {
    this.generateBlockmlDialogRef = this.dialog.open(
      dialogs.GenerateBlockmlDialogComponent,
      {
        disableClose: false,
        autoFocus: false
      }
    );

    this.generateBlockmlDialogRef.afterClosed().subscribe(() => {
      this.generateBlockmlDialogRef = null;
    });
  }

  showMemberPictureDialog(data: { row: any }) {
    this.showBigPictureDialogRef = this.dialog.open(
      dialogs.MemberPictureDialogComponent,
      {
        disableClose: false,
        autoFocus: false,
        data: data
      }
    );

    this.showBigPictureDialogRef.afterClosed().subscribe(() => {
      this.showBigPictureDialogRef = null;
    });
  }

  showAccessDeniedDialog(data: { message: string }) {
    this.accessDeniedDialogRef = this.dialog.open(
      dialogs.AccessDeniedDialogComponent,
      {
        disableClose: false,
        autoFocus: false,
        data: data
      }
    );

    this.accessDeniedDialogRef.afterClosed().subscribe(() => {
      this.accessDeniedDialogRef = null;
    });
  }
}
