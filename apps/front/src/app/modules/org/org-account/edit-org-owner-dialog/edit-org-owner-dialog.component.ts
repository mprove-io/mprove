import { CommonModule } from '@angular/common';
import {
  CUSTOM_ELEMENTS_SCHEMA,
  Component,
  HostListener,
  OnInit
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';
import { DialogRef } from '@ngneat/dialog';
import { take, tap } from 'rxjs/operators';
import { SharedModule } from '~front/app/modules/shared/shared.module';
import { NavQuery } from '~front/app/queries/nav.query';
import { OrgQuery } from '~front/app/queries/org.query';
import { ApiService } from '~front/app/services/api.service';

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

  editOrgOwnerForm: FormGroup;

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
      ownerEmail: [
        this.ref.data.ownerEmail,
        [Validators.required, Validators.email, Validators.maxLength(255)]
      ]
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

    let payload: ToBackendSetOrgOwnerRequestPayload = {
      orgId: this.ref.data.orgId,
      ownerEmail: newOwnerEmail
    };

    let apiService: ApiService = this.ref.data.apiService;

    apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendSetOrgOwner,
        payload: payload,
        showSpinner: true
      })
      .pipe(
        tap((resp: ToBackendSetOrgOwnerResponse) => {
          if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
            let org = resp.payload.org;
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
