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
import { NavQuery } from '~front/app/queries/nav.query';
import { RepoQuery } from '~front/app/queries/repo.query';
import { StructQuery } from '~front/app/queries/struct.query';
import { ApiService } from '~front/app/services/api.service';
import { FileService } from '~front/app/services/file.service';
import { NavigateService } from '~front/app/services/navigate.service';
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
    private repoQuery: RepoQuery,
    private navigateService: NavigateService,
    private navQuery: NavQuery,
    private spinner: NgxSpinnerService,
    public structQuery: StructQuery,
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
      theirBranchId: this.selectedBranchItem.branchId
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
            this.repoQuery.update(resp.payload.repo);
            this.structQuery.update(resp.payload.struct);
            this.navQuery.updatePart({
              needValidate: resp.payload.needValidate
            });

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
