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
import { DialogRef } from '@ngneat/dialog';
import { take, tap } from 'rxjs/operators';
import type { ToBackendSetOrgInfoOutput } from '#common/types/backend/routes/orgs/set-org-info/set-org-info-output';
import type { ToBackendSetOrgInfoRequest } from '#common/types/backend/routes/orgs/set-org-info/set-org-info-request';
import { SharedModule } from '#front/app/modules/shared/shared.module';
import { NavQuery } from '#front/app/queries/nav.query';
import { OrgQuery } from '#front/app/queries/org.query';
import { ApiService } from '#front/app/services/api.service';
import { SpinnerService } from '#front/app/services/spinner.service';

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

  editOrgNameForm: FormGroup<{
    orgName: FormControl<string>;
  }>;

  orgId: string;

  constructor(
    private spinnerService: SpinnerService,
    public ref: DialogRef<EditOrgNameDialogData>,
    private fb: FormBuilder,
    private orgQuery: OrgQuery,
    private navQuery: NavQuery
  ) {}

  ngOnInit() {
    this.editOrgNameForm = this.fb.group({
      orgName: this.fb.control<string>(this.ref.data.orgName, [
        Validators.maxLength(255)
      ])
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
        payload: payload
      })
      .pipe(
        tap(resp => {
          if (resp.type !== 'Success') {
            return;
          }

          let output: ToBackendSetOrgInfoOutput = resp.output;

          let org = output.org;
          this.orgQuery.update(org);
          this.navQuery.updatePart({
            orgId: org.orgId,
            orgName: org.name,
            orgOwnerId: org.ownerId
          });
        }),
        take(1),
        this.spinnerService.appTrack()
      )
      .subscribe();
  }

  cancel() {
    this.ref.close();
  }
}
