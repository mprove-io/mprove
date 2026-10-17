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
  type FormControl,
  type FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';
import { DialogRef } from '@ngneat/dialog';
import { take, tap } from 'rxjs/operators';
import {
  PATH_ACCOUNT,
  PATH_ORG,
  PROD_REPO_ID,
  PROJECT_ENV_PROD
} from '#common/constants/top';
import { LOCAL_STORAGE_PROJECT_ID } from '#common/constants/top-front';
import type { ToBackendCreateOrgOutput } from '#common/types/backend/routes/orgs/create-org/create-org-output';
import type { ToBackendCreateOrgRequest } from '#common/types/backend/routes/orgs/create-org/create-org-request';
import { SharedModule } from '#front/app/modules/shared/shared.module';
import { NavQuery } from '#front/app/queries/nav.query';
import { ApiService } from '#front/app/services/api.service';
import { AppSpinnerService } from '#front/app/services/app-spinner.service';

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

  createOrgForm: FormGroup<{
    orgName: FormControl<string>;
  }>;

  constructor(
    private appSpinnerService: AppSpinnerService,
    public ref: DialogRef<CreateOrgDialogData>,
    private fb: FormBuilder,
    private navQuery: NavQuery,
    private router: Router
  ) {}

  ngOnInit() {
    let orgName: string;

    this.createOrgForm = this.fb.group({
      orgName: this.fb.control<string>(orgName, [
        Validators.required,
        Validators.maxLength(255)
      ])
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

    this.ref.close();

    let payload: ToBackendCreateOrgRequest['input'] = {
      name: this.createOrgForm.value.orgName
    };

    let apiService: ApiService = this.ref.data.apiService;

    apiService
      .req({
        route: 'api/ToBackendCreateOrg',
        payload: payload
      })
      .pipe(
        tap(resp => {
          if (resp.type !== 'Success') {
            return;
          }

          let output: ToBackendCreateOrgOutput = resp.output;

          this.router.navigate([PATH_ORG, output.org.orgId, PATH_ACCOUNT]);

          this.navQuery.updatePart({
            projectId: undefined,
            projectName: undefined,
            projectDefaultBranch: undefined,
            repoId: PROD_REPO_ID,
            repoType: 'production',
            branchId: undefined,
            envId: PROJECT_ENV_PROD,
            needValidate: false
          });

          localStorage.removeItem(LOCAL_STORAGE_PROJECT_ID);
        }),
        take(1),
        this.appSpinnerService.track()
      )
      .subscribe();
  }

  cancel() {
    this.ref.close();
  }
}
