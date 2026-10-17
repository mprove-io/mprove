import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  HostListener,
  OnInit
} from '@angular/core';
import { DialogRef } from '@ngneat/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { take, tap } from 'rxjs/operators';
import { decodeFilePath } from '#common/functions/decode-file-path/decode-file-path';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { ToBackendDeleteFolderOutput } from '#common/types/backend/routes/folders/delete-folder/delete-folder-output';
import type { ToBackendDeleteFolderRequest } from '#common/types/backend/routes/folders/delete-folder/delete-folder-request';
import { FileQuery } from '#front/app/queries/file.query';
import { NavQuery } from '#front/app/queries/nav.query';
import { RepoQuery } from '#front/app/queries/repo.query';
import { StructQuery } from '#front/app/queries/struct.query';
import { UiQuery } from '#front/app/queries/ui.query';
import { ApiService } from '#front/app/services/api.service';
import { NavigateService } from '#front/app/services/navigate.service';
import { SpinnerService } from '#front/app/services/spinner.service';

export interface DeleteFolderDialogData {
  apiService: ApiService;
  projectId: string;
  repoId: string;
  branchId: string;
  envId: string;
  folderNodeId: string;
  folderName: string;
}

@Component({
  selector: 'm-delete-folder-dialog',
  templateUrl: './delete-folder-dialog.component.html',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule]
})
export class DeleteFolderDialogComponent implements OnInit {
  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.ref.close();
  }

  constructor(
    private spinnerService: SpinnerService,
    public ref: DialogRef<DeleteFolderDialogData>,
    private repoQuery: RepoQuery,
    private navigateService: NavigateService,
    private navQuery: NavQuery,
    private uiQuery: UiQuery,
    private fileQuery: FileQuery,
    private spinner: NgxSpinnerService,
    private structQuery: StructQuery
  ) {}

  ngOnInit(): void {
    setTimeout(() => {
      (document.activeElement as HTMLElement).blur();
    }, 0);
  }

  delete() {
    this.ref.close();

    let isNavigateNewFile = false;
    let selectedFileId = this.fileQuery.getValue().fileId;

    if (isDefined(selectedFileId)) {
      let selectedPath = decodeFilePath({ filePath: selectedFileId });

      let fromPath = this.ref.data.folderNodeId.split('/').slice(1).join('/');

      if (selectedPath.startsWith(fromPath + '/')) {
        isNavigateNewFile = true;
      }
    }

    let isRemoveSecondFile = false;
    let secondFileNodeId = this.uiQuery.getValue().secondFileNodeId;

    if (isDefined(secondFileNodeId)) {
      if (secondFileNodeId.startsWith(this.ref.data.folderNodeId + '/')) {
        isRemoveSecondFile = true;
      }
    }

    let payload: ToBackendDeleteFolderRequest['input'] = {
      projectId: this.ref.data.projectId,
      repoId: this.ref.data.repoId,
      branchId: this.ref.data.branchId,
      envId: this.ref.data.envId,
      folderNodeId: this.ref.data.folderNodeId
    };

    let apiService: ApiService = this.ref.data.apiService;

    apiService
      .req({
        route: 'api/ToBackendDeleteFolder',
        payload: payload
      })
      .pipe(
        tap(resp => {
          if (resp.type !== 'Success') {
            return;
          }

          let output: ToBackendDeleteFolderOutput = resp.output;

          this.repoQuery.update(output.repo);
          this.structQuery.update(output.struct);
          this.navQuery.updatePart({
            needValidate: output.needValidate
          });

          if (isRemoveSecondFile === true) {
            this.uiQuery.updatePart({ secondFileNodeId: undefined });
          }

          if (isNavigateNewFile === true) {
            this.navigateService.navigateToBuilder();
          }
        }),
        take(1),
        this.spinnerService.appTrack()
      )
      .subscribe();
  }

  cancel() {
    this.ref.close();
  }
}
