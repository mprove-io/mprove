import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  HostListener,
  OnInit,
  ViewChild
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { NgSelectComponent, NgSelectModule } from '@ng-select/ng-select';
import { DialogRef } from '@ngneat/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { take, tap } from 'rxjs/operators';
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { BranchItem } from '#common/interfaces/front/branch-item';
import {
  ToBackendMergeRepoRequestPayload,
  ToBackendMergeRepoResponse
} from '#common/interfaces/to-backend/repos/to-backend-merge-repo';
import { SharedModule } from '#front/app/modules/shared/shared.module';
import { NavQuery } from '#front/app/queries/nav.query';
import { RepoQuery } from '#front/app/queries/repo.query';
import { StructQuery } from '#front/app/queries/struct.query';
import { ApiService } from '#front/app/services/api.service';
import { FileService } from '#front/app/services/file.service';
import { NavigateService } from '#front/app/services/navigate.service';

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
  templateUrl: './merge-branch-dialog.component.html',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, ReactiveFormsModule, SharedModule, NgSelectModule]
})
export class MergeBranchDialogComponent implements OnInit {
  @ViewChild('mergeBranchSelect', { static: false })
  mergeBranchSelectElement: NgSelectComponent;

  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.mergeBranchSelectElement?.close();
  }

  mergeForm: FormGroup;

  branchesList: BranchItem[] = this.ref.data.branchesList.filter(
    (x: BranchItem) => x.isRepoProd === false
  );

  selectedBranchItem: BranchItem = undefined;

  constructor(
    public ref: DialogRef<MergeBranchDialogData>,
    private fb: FormBuilder,
    private repoQuery: RepoQuery,
    private navigateService: NavigateService,
    private navQuery: NavQuery,
    private spinner: NgxSpinnerService,
    private structQuery: StructQuery,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    let branchId: string;

    this.mergeForm = this.fb.group({
      branch: [undefined, [Validators.required]]
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

    let payload: ToBackendMergeRepoRequestPayload = {
      projectId: this.ref.data.projectId,
      branchId: this.ref.data.currentBranchId,
      envId: this.ref.data.envId,
      theirBranchId: this.selectedBranchItem.branchId
    };

    let apiService: ApiService = this.ref.data.apiService;
    let fileService: FileService = this.ref.data.fileService;

    apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendMergeRepo,
        payload: payload,
        showSpinner: true
      })
      .pipe(
        tap((resp: ToBackendMergeRepoResponse) => {
          if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
            this.repoQuery.update(resp.payload.repo);
            this.structQuery.update(resp.payload.struct);
            this.navQuery.updatePart({
              needValidate: resp.payload.needValidate
            });

            this.navigateService.navigateToBuilder();
          }
        }),
        take(1)
      )
      .subscribe();
  }

  branchChange(branchItem: any) {
    this.selectedBranchItem = this.branchesList.find(
      x => x.extraId === (branchItem as BranchItem).extraId
    );

    this.cd.detectChanges();
  }

  cancel() {
    this.ref.close();
  }
}
