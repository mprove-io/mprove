import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  HostListener,
  OnInit
} from '@angular/core';
import { DialogRef } from '@ngneat/dialog';
import { take, tap } from 'rxjs/operators';
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { decodeFilePath } from '#common/functions/decode-file-path';
import { isDefined } from '#common/functions/is-defined';
import {
  ToBackendDeleteFileRequestPayload,
  ToBackendDeleteFileResponse
} from '#common/interfaces/to-backend/files/to-backend-delete-file';
import { FileQuery } from '#front/app/queries/file.query';
import { NavQuery } from '#front/app/queries/nav.query';
import { RepoQuery } from '#front/app/queries/repo.query';
import { StructQuery } from '#front/app/queries/struct.query';
import { UiQuery } from '#front/app/queries/ui.query';
import { ApiService } from '#front/app/services/api.service';
import { NavigateService } from '#front/app/services/navigate.service';

export interface DeleteFileDialogData {
  apiService: ApiService;
  projectId: string;
  branchId: string;
  envId: string;
  fileNodeId: string;
  fileName: string;
}

@Component({
  selector: 'm-delete-file-dialog',
  templateUrl: './delete-file-dialog.component.html',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule]
})
export class DeleteFileDialogComponent implements OnInit {
  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.ref.close();
  }

  constructor(
    public ref: DialogRef<DeleteFileDialogData>,
    private repoQuery: RepoQuery,
    private navigateService: NavigateService,
    private fileQuery: FileQuery,
    private uiQuery: UiQuery,
    private navQuery: NavQuery,
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

      let fromPath = this.ref.data.fileNodeId.split('/').slice(1).join('/');

      if (selectedPath === fromPath) {
        isNavigateNewFile = true;
      }
    }

    let isRemoveSecondFile = false;
    let secondFileNodeId = this.uiQuery.getValue().secondFileNodeId;

    if (isDefined(secondFileNodeId)) {
      if (secondFileNodeId === this.ref.data.fileNodeId) {
        isRemoveSecondFile = true;
      }
    }

    let payload: ToBackendDeleteFileRequestPayload = {
      projectId: this.ref.data.projectId,
      branchId: this.ref.data.branchId,
      envId: this.ref.data.envId,
      fileNodeId: this.ref.data.fileNodeId
    };

    let apiService: ApiService = this.ref.data.apiService;

    apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendDeleteFile,
        payload: payload,
        showSpinner: true
      })
      .pipe(
        tap((resp: ToBackendDeleteFileResponse) => {
          if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
            this.repoQuery.update(resp.payload.repo);
            this.structQuery.update(resp.payload.struct);
            this.navQuery.updatePart({
              needValidate: resp.payload.needValidate
            });

            if (isRemoveSecondFile === true) {
              this.uiQuery.updatePart({ secondFileNodeId: undefined });
            }

            if (isNavigateNewFile === true) {
              this.navigateService.navigateToFiles();
            }
          }
        }),
        take(1)
      )
      .subscribe();
  }

  cancel() {
    this.ref.close();
  }
}
