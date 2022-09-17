import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogRef } from '@ngneat/dialog';
import { take, tap } from 'rxjs/operators';
import { ApiService } from '~front/app/services/api.service';
import { RepoStore } from '~front/app/stores/repo.store';
import { StructStore } from '~front/app/stores/struct.store';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';

@Component({
  selector: 'm-commit-dialog',
  templateUrl: './commit-dialog.component.html'
})
export class CommitDialogComponent implements OnInit {
  commitForm: FormGroup;

  constructor(
    public ref: DialogRef,
    private fb: FormBuilder,
    public repoStore: RepoStore,
    public structStore: StructStore
  ) {}

  ngOnInit() {
    let message: string;

    this.commitForm = this.fb.group({
      message: [message, [Validators.required, Validators.maxLength(255)]]
    });
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

    apiService
      .req(
        apiToBackend.ToBackendRequestInfoNameEnum.ToBackendCommitRepo,
        payload
      )
      .pipe(
        tap((resp: apiToBackend.ToBackendCommitRepoResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            this.repoStore.update(resp.payload.repo);
            this.structStore.update(resp.payload.struct);
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
