import { CommonModule } from '@angular/common';
import {
  CUSTOM_ELEMENTS_SCHEMA,
  Component,
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
import { UiQuery } from '~front/app/queries/ui.query';
import { ApiService } from '~front/app/services/api.service';
import { NavigateService } from '~front/app/services/navigate.service';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';

export interface DeleteFolderDialogData {
  apiService: ApiService;
  projectId: string;
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

    if (common.isDefined(selectedFileId)) {
      let selectedPath = common.decodeFilePath({ filePath: selectedFileId });

      let fromPath = this.ref.data.folderNodeId.split('/').slice(1).join('/');

      if (selectedPath.startsWith(fromPath + '/')) {
        isNavigateNewFile = true;
      }
    }

    let isRemoveSecondFile = false;
    let secondFileNodeId = this.uiQuery.getValue().secondFileNodeId;

    if (common.isDefined(secondFileNodeId)) {
      if (secondFileNodeId.startsWith(this.ref.data.folderNodeId + '/')) {
        isRemoveSecondFile = true;
      }
    }

    let payload: apiToBackend.ToBackendDeleteFolderRequestPayload = {
      projectId: this.ref.data.projectId,
      branchId: this.ref.data.branchId,
      envId: this.ref.data.envId,
      folderNodeId: this.ref.data.folderNodeId
    };

    let apiService: ApiService = this.ref.data.apiService;

    apiService
      .req({
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendDeleteFolder,
        payload: payload,
        showSpinner: true
      })
      .pipe(
        tap((resp: apiToBackend.ToBackendDeleteFolderResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
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
