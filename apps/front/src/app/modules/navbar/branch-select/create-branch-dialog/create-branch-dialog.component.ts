import { CommonModule } from '@angular/common';
import {
  CUSTOM_ELEMENTS_SCHEMA,
  ChangeDetectorRef,
  Component,
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
import { Router } from '@angular/router';
import { NgSelectComponent, NgSelectModule } from '@ng-select/ng-select';
import { DialogRef } from '@ngneat/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { take, tap } from 'rxjs/operators';
import { BranchItem } from '~front/app/interfaces/branch-item';
import { SharedModule } from '~front/app/modules/shared/shared.module';
import { NavQuery, NavState } from '~front/app/queries/nav.query';
import { UserQuery, UserState } from '~front/app/queries/user.query';
import { ApiService } from '~front/app/services/api.service';

export interface CreateBranchDialogData {
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
  templateUrl: './create-branch-dialog.component.html',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, ReactiveFormsModule, NgSelectModule, SharedModule]
})
export class CreateBranchDialogComponent implements OnInit {
  @ViewChild('createBranchSelect', { static: false })
  createBranchSelectElement: NgSelectComponent;

  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.createBranchSelectElement?.close();
    // this.ref.close();
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
        .makeCopy<BranchItem[]>(this.ref.data.branchesList)
        .filter(y => y.isRepoProd === this.isTargetProd);

      this.cd.detectChanges();
    })
  );

  branchesList: BranchItem[] = [];
  //  = common
  //   .makeCopy<BranchItem[]>(this.ref.data.branchesList)
  //   .filter(y => y.isRepoProd === this.nav.isRepoProd);
  // .map(x => {
  //   if (x.isRepoProd === true) {
  //     let name = x.extraName.substring(10, x.extraName.length);

  //     x.extraName = `remote${name}`;
  //   }
  //   return x;
  // });

  selectedBranchItem: BranchItem = this.ref.data.selectedBranchItem;
  selectedBranchExtraId: string = this.ref.data.selectedBranchExtraId;

  isTargetProd = false;

  constructor(
    public ref: DialogRef<CreateBranchDialogData>,
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
      .makeCopy<BranchItem[]>(this.ref.data.branchesList)
      .filter(y => y.isRepoProd === this.isTargetProd);

    this.selectedBranchItem = this.branchesList[0];
    this.selectedBranchExtraId = this.selectedBranchItem.extraId;

    this.cd.detectChanges();
  }

  devOnClick() {
    this.isTargetProd = false;

    this.branchesList = common
      .makeCopy<BranchItem[]>(this.ref.data.branchesList)
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

    this.spinner.show(APP_SPINNER_NAME);

    this.ref.close();

    let payload: ToBackendCreateBranchRequestPayload = {
      projectId: this.ref.data.projectId,
      newBranchId: this.createBranchForm.value.branchId,
      fromBranchId: this.selectedBranchItem.branchId,
      isRepoProd: this.isTargetProd
    };

    let apiService: ApiService = this.ref.data.apiService;

    apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendCreateBranch,
        payload: payload
      })
      .pipe(
        tap((resp: ToBackendCreateBranchResponse) => {
          if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
            let userId;
            this.userQuery.userId$
              .pipe(
                tap(x => (userId = x)),
                take(1)
              )
              .subscribe();

            let repoId = this.isTargetProd === true ? PROD_REPO_ID : userId;

            this.router.navigate([
              PATH_ORG,
              this.ref.data.orgId,
              PATH_PROJECT,
              this.ref.data.projectId,
              PATH_REPO,
              repoId,
              PATH_BRANCH,
              this.createBranchForm.value.branchId,
              PATH_ENV,
              this.nav.envId,
              PATH_FILES
            ]);
          }
        }),
        take(1)
      )
      .subscribe();
  }

  // branchChange(branchItem: BranchItem) {
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
