import {
  ChangeDetectorRef,
  Component,
  HostListener,
  OnInit
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogRef } from '@ngneat/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { take, tap } from 'rxjs/operators';
import { BranchItem } from '~front/app/interfaces/branch-item';
import { ApiService } from '~front/app/services/api.service';
import { FileService } from '~front/app/services/file.service';
import { NavigateService } from '~front/app/services/navigate.service';
import { NavState, NavStore } from '~front/app/stores/nav.store';
import { RepoStore } from '~front/app/stores/repo.store';
import { StructStore } from '~front/app/stores/struct.store';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { interfaces } from '~front/barrels/interfaces';

export interface MergeBranchDialogData {
  apiService: ApiService;
  fileService: FileService;
  projectId: string;
  fileId: string;
  currentBranchId: string;
  currentBranchExtraName: string;
  envId: string;
  branchesList: BranchItem[];
}

@Component({
  selector: 'm-merge-branch-dialog',
  templateUrl: './merge-branch-dialog.component.html'
})
export class MergeBranchDialogComponent implements OnInit {
  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.ref.close();
  }

  mergeForm: FormGroup;

  branchesList: interfaces.BranchItem[] = this.ref.data.branchesList.filter(
    (x: interfaces.BranchItem) => x.isRepoProd === false
  );

  selectedBranchItem: interfaces.BranchItem = undefined;

  constructor(
    public ref: DialogRef<MergeBranchDialogData>,
    private fb: FormBuilder,
    private repoStore: RepoStore,
    private navigateService: NavigateService,
    private navStore: NavStore,
    private spinner: NgxSpinnerService,
    public structStore: StructStore,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    let branchId: string;

    this.mergeForm = this.fb.group({
      branch: [
        undefined,
        [Validators.required]
        // this.selectedBranchExtraId
      ]
    });

    this.branchesList = this.branchesList.filter(
      x => x.extraName !== this.ref.data.currentBranchExtraName
    );

    setTimeout(() => {
      (document.activeElement as HTMLElement).blur();
    }, 0);
  }

  merge() {
    this.mergeForm.markAllAsTouched();

    if (!this.mergeForm.valid) {
      return;
    }

    this.ref.close();

    let payload: apiToBackend.ToBackendMergeRepoRequestPayload = {
      projectId: this.ref.data.projectId,
      branchId: this.ref.data.currentBranchId,
      envId: this.ref.data.envId,
      theirBranchId: this.selectedBranchItem.branchId,
      isTheirBranchRemote: this.selectedBranchItem.isRepoProd
    };

    let apiService: ApiService = this.ref.data.apiService;
    let fileService: FileService = this.ref.data.fileService;

    apiService
      .req({
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendMergeRepo,
        payload: payload,
        showSpinner: true
      })
      .pipe(
        tap((resp: apiToBackend.ToBackendMergeRepoResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            this.repoStore.update(resp.payload.repo);
            this.structStore.update(resp.payload.struct);
            this.navStore.update(state =>
              Object.assign({}, state, <NavState>{
                needValidate: resp.payload.needValidate
              })
            );

            this.navigateService.navigateToFiles();
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
