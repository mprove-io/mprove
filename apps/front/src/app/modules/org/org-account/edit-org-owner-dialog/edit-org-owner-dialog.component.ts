import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  HostListener,
  OnInit
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
import { PATH_ORG_OWNER_CHANGED } from '#common/constants/top';
import {
  LOCAL_STORAGE_CHANGED_OWNER_ORG_NAME,
  LOCAL_STORAGE_NEW_ORG_OWNER
} from '#common/constants/top-front';
import type { ToBackendSetOrgOwnerRequest } from '#common/types/backend/routes/orgs/set-org-owner/set-org-owner-request';
import type { ToBackendSetOrgOwnerResponse } from '#common/types/backend/routes/orgs/set-org-owner/set-org-owner-response';
import { SharedModule } from '#front/app/modules/shared/shared.module';
import { NavQuery } from '#front/app/queries/nav.query';
import { OrgQuery } from '#front/app/queries/org.query';
import { ApiService } from '#front/app/services/api.service';

export interface EditOrgOwnerDialogData {
  apiService: ApiService;
  orgId: string;
  ownerEmail: string;
}

@Component({
  selector: 'm-edit-org-owner-dialog',
  templateUrl: './edit-org-owner-dialog.component.html',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, ReactiveFormsModule, SharedModule]
})
export class EditOrgOwnerDialogComponent implements OnInit {
  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.ref.close();
  }

  editOrgOwnerForm: FormGroup<{
    ownerEmail: FormControl<string>;
  }>;

  orgId: string;

  constructor(
    public ref: DialogRef<EditOrgOwnerDialogData>,
    private fb: FormBuilder,
    private orgQuery: OrgQuery,
    private router: Router,
    private navQuery: NavQuery
  ) {}

  ngOnInit() {
    this.editOrgOwnerForm = this.fb.group({
      ownerEmail: this.fb.control<string>(this.ref.data.ownerEmail, [
        Validators.required,
        Validators.email,
        Validators.maxLength(255)
      ])
    });

    setTimeout(() => {
      (document.activeElement as HTMLElement).blur();
    }, 0);
  }

  save() {
    this.editOrgOwnerForm.markAllAsTouched();

    if (!this.editOrgOwnerForm.valid) {
      return;
    }

    this.ref.close();

    let newOwnerEmail = this.editOrgOwnerForm.value.ownerEmail;

    let payload: ToBackendSetOrgOwnerRequest['input'] = {
      orgId: this.ref.data.orgId,
      ownerEmail: newOwnerEmail
    };

    let apiService: ApiService = this.ref.data.apiService;

    apiService
      .req({
        route: 'api/ToBackendSetOrgOwner',
        payload: payload,
        showSpinner: true
      })
      .pipe(
        tap((resp: ToBackendSetOrgOwnerResponse) => {
          if (resp.type === 'Success') {
            let org = resp.output.org;
            localStorage.setItem(
              LOCAL_STORAGE_CHANGED_OWNER_ORG_NAME,
              org.name
            );
            localStorage.setItem(LOCAL_STORAGE_NEW_ORG_OWNER, newOwnerEmail);
            this.router.navigate([PATH_ORG_OWNER_CHANGED]);
            this.orgQuery.reset();
            this.navQuery.clearOrgAndDeps();
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
