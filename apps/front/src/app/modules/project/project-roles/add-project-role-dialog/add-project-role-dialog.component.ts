import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  type ElementRef,
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
import type { ToBackendCreateRoleRequest } from '#common/types/backend/routes/roles/create-role/create-role-request';
import type { ToBackendCreateRoleResponse } from '#common/types/backend/routes/roles/create-role/create-role-response';
import { SharedModule } from '#front/app/modules/shared/shared.module';
import { MemberQuery } from '#front/app/queries/member.query';
import { RolesQuery } from '#front/app/queries/roles.query';
import type { ApiService } from '#front/app/services/api.service';
import { ValidationService } from '#front/app/services/validation.service';

export interface AddProjectRoleDialogData {
  apiService: ApiService;
  projectId: string;
}

@Component({
  selector: 'm-add-project-role-dialog',
  templateUrl: './add-project-role-dialog.component.html',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, ReactiveFormsModule, SharedModule]
})
export class AddProjectRoleDialogComponent implements OnInit {
  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.ref.close();
  }

  @ViewChild('roleId') roleIdElement: ElementRef;

  dataItem: AddProjectRoleDialogData = this.ref.data;

  addProjectRoleForm: FormGroup<{
    roleId: FormControl<string>;
  }>;

  constructor(
    public ref: DialogRef<AddProjectRoleDialogData>,
    private fb: FormBuilder,
    private memberQuery: MemberQuery,
    private rolesQuery: RolesQuery
  ) {}

  ngOnInit() {
    this.addProjectRoleForm = this.fb.group({
      roleId: this.fb.control<string>(undefined, [
        Validators.required,
        ValidationService.roleIdWrongChars,
        Validators.maxLength(32)
      ])
    });

    setTimeout(() => {
      this.roleIdElement.nativeElement.focus();
    }, 0);
  }

  add() {
    this.addProjectRoleForm.markAllAsTouched();

    if (!this.addProjectRoleForm.valid) {
      return;
    }

    this.ref.close();

    let payload: ToBackendCreateRoleRequest['input'] = {
      projectId: this.dataItem.projectId,
      roleId: this.addProjectRoleForm.value.roleId
    };

    let apiService: ApiService = this.dataItem.apiService;

    apiService
      .req({
        route: 'api/ToBackendCreateRole',
        payload: payload,
        showSpinner: true
      })
      .pipe(
        tap((resp: ToBackendCreateRoleResponse) => {
          if (resp.type === 'Success') {
            this.memberQuery.update(resp.output.userMember);
            this.rolesQuery.update({ roles: resp.output.roles });
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
