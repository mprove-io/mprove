import {
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogRef } from '@ngneat/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { of } from 'rxjs';
import { map, switchMap, take, tap } from 'rxjs/operators';
import { ApiService } from '~front/app/services/api.service';
import { FileService } from '~front/app/services/file.service';
import { NavigateService } from '~front/app/services/navigate.service';
import { RepoStore } from '~front/app/stores/repo.store';
import { StructStore } from '~front/app/stores/struct.store';
import { UiStore } from '~front/app/stores/ui.store';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { constants } from '~front/barrels/constants';

export interface CommitDialogDialogData {
  apiService: ApiService;
  projectId: string;
  isRepoProd: boolean;
  branchId: string;
  panel: common.PanelEnum;
  fileId: string;
}

@Component({
  selector: 'm-commit-dialog',
  templateUrl: './commit-dialog.component.html'
})
export class CommitDialogComponent implements OnInit {
  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.ref.close();
  }

  @ViewChild('commitMessage') commitMessageElement: ElementRef;

  commitForm: FormGroup;

  constructor(
    public ref: DialogRef<CommitDialogDialogData>,
    private fb: FormBuilder,
    private navigateService: NavigateService,
    private spinner: NgxSpinnerService,
    private fileService: FileService,
    public repoStore: RepoStore,
    public uiStore: UiStore,
    public structStore: StructStore
  ) {}

  ngOnInit() {
    let message: string;

    this.commitForm = this.fb.group({
      message: [message, [Validators.required, Validators.maxLength(255)]]
    });

    setTimeout(() => {
      this.commitMessageElement.nativeElement.focus();
    }, 0);
  }

  commit() {
    this.commitForm.markAllAsTouched();

    if (!this.commitForm.valid) {
      return;
    }

    this.ref.close();

    let apiService: ApiService = this.ref.data.apiService;

    let payload: apiToBackend.ToBackendCommitRepoRequestPayload = {
      projectId: this.ref.data.projectId,
      isRepoProd: this.ref.data.isRepoProd,
      branchId: this.ref.data.branchId,
      commitMessage: this.commitForm.value.message
    };

    this.spinner.show(constants.APP_SPINNER_NAME);

    apiService
      .req({
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendCommitRepo,
        payload: payload
      })
      .pipe(
        map((resp: apiToBackend.ToBackendCommitRepoResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            this.repoStore.update(resp.payload.repo);

            return true;
          } else {
            return false;
          }
        }),
        switchMap(x =>
          x === true && common.isDefined(this.ref.data.fileId)
            ? this.fileService.getFile({
                fileId: this.ref.data.fileId,
                panel: this.ref.data.panel
              })
            : of([])
        ),
        tap(x => this.spinner.hide(constants.APP_SPINNER_NAME)),
        take(1)
      )
      .subscribe();
  }

  cancel() {
    this.ref.close();
  }
}
