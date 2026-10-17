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
import { DialogRef } from '@ngneat/dialog';
import { take, tap } from 'rxjs/operators';
import type { Given } from '#common/types/backend/parts/given/given';
import type { GivenType } from '#common/types/backend/parts/given/given-type';
import type { Gv } from '#common/types/backend/parts/gv';
import type { Role } from '#common/types/backend/parts/role';
import type { ToBackendEditRoleGivenOutput } from '#common/types/backend/routes/roles/edit-role-given/edit-role-given-output';
import type { ToBackendEditRoleGivenRequest } from '#common/types/backend/routes/roles/edit-role-given/edit-role-given-request';
import { SharedModule } from '#front/app/modules/shared/shared.module';
import { MemberQuery } from '#front/app/queries/member.query';
import { RolesQuery } from '#front/app/queries/roles.query';
import type { ApiService } from '#front/app/services/api.service';
import { AppSpinnerService } from '#front/app/services/app-spinner.service';
import { ValidationService } from '#front/app/services/validation.service';

export interface EditRoleGivenDialogData {
  apiService: ApiService;
  role: Role;
  gv: Gv;
  givens: Given[];
}

@Component({
  selector: 'm-edit-role-given-dialog',
  templateUrl: './edit-role-given-dialog.component.html',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, ReactiveFormsModule, SharedModule]
})
export class EditRoleGivenDialogComponent implements OnInit {
  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.ref.close();
  }

  dataItem: EditRoleGivenDialogData = this.ref.data;

  editRoleGivenForm: FormGroup<{
    values: FormControl<string>;
  }>;

  givenType: GivenType;
  givenIsMultiple = false;

  constructor(
    private appSpinnerService: AppSpinnerService,
    public ref: DialogRef<EditRoleGivenDialogData>,
    private fb: FormBuilder,
    private memberQuery: MemberQuery,
    private rolesQuery: RolesQuery
  ) {}

  ngOnInit() {
    let given = this.dataItem.givens.find(
      item => item.givenId === this.dataItem.gv.givenId
    );

    this.givenType = given?.type;
    this.givenIsMultiple = given?.isMultiple === true;

    this.editRoleGivenForm = this.fb.group({
      values: this.fb.control<string>(this.dataItem.gv.values.join('\n'), [
        Validators.maxLength(10000),
        ValidationService.givenValuesValidator({
          getType: () => this.givenType,
          getIsMultiple: () => this.givenIsMultiple
        })
      ])
    });

    setTimeout(() => {
      (document.activeElement as HTMLElement).blur();
    }, 0);
  }

  edit() {
    this.editRoleGivenForm.markAllAsTouched();

    if (!this.editRoleGivenForm.valid) {
      return;
    }

    this.ref.close();

    let payload: ToBackendEditRoleGivenRequest['input'] = {
      projectId: this.dataItem.role.projectId,
      roleId: this.dataItem.role.roleId,
      givenId: this.dataItem.gv.givenId,
      values: ValidationService.parseGivenValues({
        values: this.editRoleGivenForm.value.values
      })
    };

    let apiService: ApiService = this.dataItem.apiService;

    apiService
      .req({
        route: 'api/ToBackendEditRoleGiven',
        payload: payload
      })
      .pipe(
        tap(resp => {
          if (resp.type !== 'Success') {
            return;
          }

          let output: ToBackendEditRoleGivenOutput = resp.output;

          this.memberQuery.update(output.userMember);
          this.rolesQuery.update({ roles: output.roles });
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
