import {
  ChangeDetectorRef,
  Component,
  HostListener,
  OnInit
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DialogRef } from '@ngneat/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { take, tap } from 'rxjs/operators';
import { BranchItem } from '~front/app/interfaces/branch-item';
import { NavQuery } from '~front/app/queries/nav.query';
import { UserQuery } from '~front/app/queries/user.query';
import { ApiService } from '~front/app/services/api.service';
import { NavState } from '~front/app/stores/nav.store';
import { UserState } from '~front/app/stores/user.store';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { constants } from '~front/barrels/constants';
import { interfaces } from '~front/barrels/interfaces';

export interface CreateBranchDialogDataItem {
  apiService: ApiService;
  orgId: string;
  projectId: string;
  branchesList: BranchItem[];
  selectedBranchItem: BranchItem;
  selectedBranchExtraId: string;
  hideBranchSelectFn: () => void;
}

@Component({
  selector: 'm-create-branch-dialog',
  templateUrl: './create-branch-dialog.component.html'
})
export class CreateBranchDialogComponent implements OnInit {
  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.ref.close();
  }

  createBranchForm: FormGroup;

  user: UserState;
  user$ = this.userQuery.select().pipe(
    tap(x => {
      this.user = x;
      this.cd.detectChanges();
    }),
    take(1)
  );

  nav: NavState;
  nav$ = this.navQuery.select().pipe(
    tap(x => {
      this.nav = x;

      this.isTargetProd = this.nav.isRepoProd;

      this.branchesList = common
        .makeCopy<interfaces.BranchItem[]>(this.ref.data.branchesList)
        .filter(y => y.isRepoProd === this.isTargetProd);

      this.cd.detectChanges();
    })
  );

  branchesList: interfaces.BranchItem[] = [];
  //  = common
  //   .makeCopy<interfaces.BranchItem[]>(this.ref.data.branchesList)
  //   .filter(y => y.isRepoProd === this.nav.isRepoProd);
  // .map(x => {
  //   if (x.isRepoProd === true) {
  //     let name = x.extraName.substring(10, x.extraName.length);

  //     x.extraName = `remote${name}`;
  //   }
  //   return x;
  // });

  selectedBranchItem: interfaces.BranchItem = this.ref.data.selectedBranchItem;
  selectedBranchExtraId: string = this.ref.data.selectedBranchExtraId;

  isTargetProd = false;

  constructor(
    public ref: DialogRef<CreateBranchDialogDataItem>,
    private fb: FormBuilder,
    private router: Router,
    private userQuery: UserQuery,
    private spinner: NgxSpinnerService,
    private cd: ChangeDetectorRef,
    private navQuery: NavQuery
  ) {}

  ngOnInit() {
    let branchId: string;

    this.createBranchForm = this.fb.group({
      branchId: [branchId, [Validators.maxLength(255)]],
      fromBranch: [this.selectedBranchExtraId]
    });

    setTimeout(() => {
      (document.activeElement as HTMLElement).blur();
    }, 0);
  }

  prodOnClick() {
    this.isTargetProd = true;

    this.branchesList = common
      .makeCopy<interfaces.BranchItem[]>(this.ref.data.branchesList)
      .filter(y => y.isRepoProd === this.isTargetProd);

    this.selectedBranchItem = this.branchesList[0];
    this.selectedBranchExtraId = this.selectedBranchItem.extraId;

    this.cd.detectChanges();
  }

  devOnClick() {
    this.isTargetProd = false;

    this.branchesList = common
      .makeCopy<interfaces.BranchItem[]>(this.ref.data.branchesList)
      .filter(y => y.isRepoProd === this.isTargetProd);

    this.selectedBranchItem = this.branchesList[0];
    this.selectedBranchExtraId = this.selectedBranchItem.extraId;

    this.cd.detectChanges();
  }

  create() {
    this.createBranchForm.markAllAsTouched();

    if (!this.createBranchForm.valid) {
      return;
    }

    this.ref.data.hideBranchSelectFn();

    this.spinner.show(constants.APP_SPINNER_NAME);

    this.ref.close();

    let payload: apiToBackend.ToBackendCreateBranchRequestPayload = {
      projectId: this.ref.data.projectId,
      newBranchId: this.createBranchForm.value.branchId,
      fromBranchId: this.selectedBranchItem.branchId,
      isRepoProd: this.isTargetProd
    };

    let apiService: ApiService = this.ref.data.apiService;

    apiService
      .req({
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendCreateBranch,
        payload: payload
      })
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

            let repoId =
              this.isTargetProd === true ? common.PROD_REPO_ID : userId;

            this.router.navigate([
              common.PATH_ORG,
              this.ref.data.orgId,
              common.PATH_PROJECT,
              this.ref.data.projectId,
              common.PATH_REPO,
              repoId,
              common.PATH_BRANCH,
              this.createBranchForm.value.branchId,
              common.PATH_ENV,
              this.nav.envId,
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
