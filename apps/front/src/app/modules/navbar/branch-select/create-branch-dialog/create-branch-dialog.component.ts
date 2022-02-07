import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DialogRef } from '@ngneat/dialog';
import { take, tap } from 'rxjs/operators';
import { UserQuery } from '~front/app/queries/user.query';
import { ApiService } from '~front/app/services/api.service';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { interfaces } from '~front/barrels/interfaces';

@Component({
  selector: 'm-create-branch-dialog',
  templateUrl: './create-branch-dialog.component.html'
})
export class CreateBranchDialogComponent implements OnInit {
  createBranchForm: FormGroup;

  branchesList: interfaces.BranchItem[] = this.ref.data.branchesList;

  selectedBranchItem: interfaces.BranchItem = this.ref.data.selectedBranchItem;
  selectedBranchExtraId: string = this.ref.data.selectedBranchExtraId;

  constructor(
    public ref: DialogRef,
    private fb: FormBuilder,
    private router: Router,
    private userQuery: UserQuery,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    let branchId: string;

    this.createBranchForm = this.fb.group({
      branchId: [branchId, [Validators.maxLength(255)]],
      fromBranch: [this.selectedBranchExtraId]
    });
  }

  create() {
    this.createBranchForm.markAllAsTouched();

    if (!this.createBranchForm.valid) {
      return;
    }

    this.ref.close();

    let payload: apiToBackend.ToBackendCreateBranchRequestPayload = {
      projectId: this.ref.data.projectId,
      newBranchId: this.createBranchForm.value.branchId,
      fromBranchId: this.selectedBranchItem.branchId,
      isFromRemote: this.selectedBranchItem.isRepoProd
    };

    let apiService: ApiService = this.ref.data.apiService;

    apiService
      .req(
        apiToBackend.ToBackendRequestInfoNameEnum.ToBackendCreateBranch,
        payload
      )
      .pipe(
        tap((resp: apiToBackend.ToBackendCreateBranchResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            let userId;
            this.userQuery.userId$
              .pipe(
                tap(x => (userId = x)),
                take(1)
              )
              .subscribe();

            let repoId = userId;

            this.router.navigate([
              common.PATH_ORG,
              this.ref.data.orgId,
              common.PATH_PROJECT,
              this.ref.data.projectId,
              common.PATH_REPO,
              repoId,
              common.PATH_BRANCH,
              this.createBranchForm.value.branchId,
              common.PATH_FILES
            ]);
          }
        }),
        take(1)
      )
      .subscribe();
  }

  branchChange(branchItem: interfaces.BranchItem) {
    this.selectedBranchItem = this.branchesList.find(
      x => x.extraId === branchItem.extraId
    );

    this.cd.detectChanges();
  }

  cancel() {
    this.ref.close();
  }
}
