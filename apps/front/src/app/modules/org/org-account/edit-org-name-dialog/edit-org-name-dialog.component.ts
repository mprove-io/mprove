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
import { DialogRef } from '@ngneat/dialog';
import { take, tap } from 'rxjs/operators';
import type { ToBackendSetOrgInfoRequest } from '#common/types/backend/routes/orgs/set-org-info/set-org-info-request';
import type { ToBackendSetOrgInfoResponse } from '#common/types/backend/routes/orgs/set-org-info/set-org-info-response';
import { SharedModule } from '#front/app/modules/shared/shared.module';
import { NavQuery } from '#front/app/queries/nav.query';
import { OrgQuery } from '#front/app/queries/org.query';
import { ApiService } from '#front/app/services/api.service';

export interface EditOrgNameDialogData {
  apiService: ApiService;
  orgId: string;
  orgName: string;
}

@Component({
  selector: 'm-edit-org-name-dialog',
  templateUrl: './edit-org-name-dialog.component.html',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, ReactiveFormsModule, SharedModule]
})
export class EditOrgNameDialogComponent implements OnInit {
  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.ref.close();
  }

  @ViewChild('orgName') orgNameElement: ElementRef;

  editOrgNameForm: FormGroup;

  orgId: string;

  constructor(
    public ref: DialogRef<EditOrgNameDialogData>,
    private fb: FormBuilder,
    private orgQuery: OrgQuery,
    private navQuery: NavQuery
  ) {}

  ngOnInit() {
    this.editOrgNameForm = this.fb.group({
      orgName: [this.ref.data.orgName, [Validators.maxLength(255)]]
    });

    setTimeout(() => {
      this.orgNameElement.nativeElement.focus();
    }, 0);
  }

  save() {
    this.editOrgNameForm.markAllAsTouched();

    if (!this.editOrgNameForm.valid) {
      return;
    }

    this.ref.close();

    let payload: ToBackendSetOrgInfoRequest['input'] = {
      orgId: this.ref.data.orgId,
      name: this.editOrgNameForm.value.orgName
    };

    let apiService: ApiService = this.ref.data.apiService;

    apiService
      .req({
        route: 'api/ToBackendSetOrgInfo',
        payload: payload,
        showSpinner: true
      })
      .pipe(
        tap((resp: ToBackendSetOrgInfoResponse) => {
          if (resp?.type === 'Success') {
            let org = resp.output.org;
            this.orgQuery.update(org);
            this.navQuery.updatePart({
              orgId: org.orgId,
              orgName: org.name,
              orgOwnerId: org.ownerId
            });
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
