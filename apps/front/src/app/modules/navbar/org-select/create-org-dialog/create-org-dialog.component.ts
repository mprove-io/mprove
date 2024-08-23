import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
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
import { DialogRef } from '@ngneat/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { take, tap } from 'rxjs/operators';
import { SharedModule } from '~front/app/modules/shared/shared.module';
import { NavQuery } from '~front/app/queries/nav.query';
import { ApiService } from '~front/app/services/api.service';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { constants } from '~front/barrels/constants';

export interface CreateOrgDialogData {
  apiService: ApiService;
}

@Component({
  selector: 'm-create-org-dialog',
  templateUrl: './create-org-dialog.component.html',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, ReactiveFormsModule, SharedModule]
})
export class CreateOrgDialogComponent implements OnInit {
  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.ref.close();
  }

  @ViewChild('orgName') orgNameElement: ElementRef;

  createOrgForm: FormGroup;

  constructor(
    public ref: DialogRef<CreateOrgDialogData>,
    private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    private navQuery: NavQuery,
    private router: Router
  ) {}

  ngOnInit() {
    let orgName: string;

    this.createOrgForm = this.fb.group({
      orgName: [orgName, [Validators.required, Validators.maxLength(255)]]
    });

    setTimeout(() => {
      this.orgNameElement.nativeElement.focus();
    }, 0);
  }

  create() {
    this.createOrgForm.markAllAsTouched();

    if (!this.createOrgForm.valid) {
      return;
    }

    this.spinner.show(constants.APP_SPINNER_NAME);

    this.ref.close();

    let payload: apiToBackend.ToBackendCreateOrgRequestPayload = {
      name: this.createOrgForm.value.orgName
    };

    let apiService: ApiService = this.ref.data.apiService;

    apiService
      .req({
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendCreateOrg,
        payload: payload
      })
      .pipe(
        tap((resp: apiToBackend.ToBackendCreateOrgResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            this.router.navigate([
              common.PATH_ORG,
              resp.payload.org.orgId,
              common.PATH_ACCOUNT
            ]);

            this.navQuery.updatePart({
              projectId: undefined,
              projectName: undefined,
              projectDefaultBranch: undefined,
              isRepoProd: true,
              branchId: undefined,
              envId: common.PROJECT_ENV_PROD,
              needValidate: false
            });

            localStorage.removeItem(constants.LOCAL_STORAGE_PROJECT_ID);
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
