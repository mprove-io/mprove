import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DialogRef } from '@ngneat/dialog';
import { map, take } from 'rxjs/operators';
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
    private router: Router
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
        map((resp: apiToBackend.ToBackendCreateBranchResponse) => {
          this.router.navigate([
            common.PATH_ORG,
            this.ref.data.orgId,
            common.PATH_PROJECT,
            this.ref.data.projectId,
            common.PATH_BRANCH,
            this.selectedBranchItem.extraId,
            common.PATH_BLOCKML
          ]);
        }),
        take(1)
      )
      .subscribe();
  }

  branchChange(branchExtraId: any) {
    console.log(branchExtraId);
    this.selectedBranchItem = this.branchesList.find(
      x => x.extraId === branchExtraId
    );
  }

  cancel() {
    this.ref.close();
  }
}
