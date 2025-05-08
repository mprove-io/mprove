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
import { FileQuery } from '~front/app/queries/file.query';
import { NavQuery } from '~front/app/queries/nav.query';
import { RepoQuery } from '~front/app/queries/repo.query';
import { StructQuery } from '~front/app/queries/struct.query';
import { ApiService } from '~front/app/services/api.service';
import { NavigateService } from '~front/app/services/navigate.service';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';

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
    private spinner: NgxSpinnerService,
    private fileQuery: FileQuery,
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

    let selectedFileId = this.fileQuery.getValue().fileId;

    let isNavigateNewFile = false;

    if (common.isDefined(selectedFileId)) {
      let selectedPath = selectedFileId
        .split(common.TRIPLE_UNDERSCORE)
        .join('/');
      let fromPath = this.ref.data.fileNodeId.split('/').slice(1).join('/');

      if (
        selectedPath.startsWith(fromPath + '/') ||
        selectedPath === fromPath
      ) {
        isNavigateNewFile = true;
      }
    }

    let payload: apiToBackend.ToBackendDeleteFileRequestPayload = {
      projectId: this.ref.data.projectId,
      branchId: this.ref.data.branchId,
      envId: this.ref.data.envId,
      fileNodeId: this.ref.data.fileNodeId
    };

    let apiService: ApiService = this.ref.data.apiService;

    apiService
      .req({
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendDeleteFile,
        payload: payload,
        showSpinner: true
      })
      .pipe(
        tap((resp: apiToBackend.ToBackendDeleteFileResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            this.repoQuery.update(resp.payload.repo);
            this.structQuery.update(resp.payload.struct);
            this.navQuery.updatePart({
              needValidate: resp.payload.needValidate
            });

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
