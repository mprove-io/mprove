import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  HostListener,
  OnInit
} from '@angular/core';
import type { FormGroup } from '@angular/forms';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { DialogRef } from '@ngneat/dialog';
import { take, tap } from 'rxjs/operators';
import type { GivenTypeEnum } from '#common/enums/given-type.enum';
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { Given } from '#common/zod/backend/given';
import type { Role } from '#common/zod/backend/role';
import type {
  ToBackendCreateRoleGivenRequestPayload,
  ToBackendCreateRoleGivenResponse
} from '#common/zod/to-backend/roles/to-backend-create-role-given';
import { SharedModule } from '#front/app/modules/shared/shared.module';
import { MemberQuery } from '#front/app/queries/member.query';
import { RolesQuery } from '#front/app/queries/roles.query';
import type { ApiService } from '#front/app/services/api.service';
import { ValidationService } from '#front/app/services/validation.service';

export interface AddRoleGivenDialogData {
  apiService: ApiService;
  role: Role;
  givens: Given[];
}

@Component({
  selector: 'm-add-role-given-dialog',
  templateUrl: './add-role-given-dialog.component.html',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, ReactiveFormsModule, SharedModule, NgSelectModule]
})
export class AddRoleGivenDialogComponent implements OnInit {
  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.ref.close();
  }

  dataItem: AddRoleGivenDialogData = this.ref.data;

  addRoleGivenForm: FormGroup;

  availableGivens: Given[] = [];

  selectedGivenType: GivenTypeEnum;
  selectedGivenIsMultiple = false;

  constructor(
    public ref: DialogRef<AddRoleGivenDialogData>,
    private fb: FormBuilder,
    private memberQuery: MemberQuery,
    private rolesQuery: RolesQuery
  ) {}

  ngOnInit() {
    this.availableGivens = this.dataItem.givens.filter(given =>
      isUndefined(
        this.dataItem.role.gvs.find(gv => gv.givenId === given.givenId)
      )
    );

    this.addRoleGivenForm = this.fb.group({
      givenId: [undefined, [Validators.required]],
      values: [
        undefined,
        [
          Validators.maxLength(10000),
          ValidationService.givenValuesValidator({
            getType: () => this.selectedGivenType,
            getIsMultiple: () => this.selectedGivenIsMultiple
          })
        ]
      ]
    });

    this.addRoleGivenForm.controls['givenId'].valueChanges.subscribe(
      (givenId: string) => {
        let selectedGiven = this.availableGivens.find(
          given => given.givenId === givenId
        );

        this.selectedGivenType = selectedGiven?.type;
        this.selectedGivenIsMultiple = selectedGiven?.isMultiple === true;
        this.addRoleGivenForm.controls['values'].updateValueAndValidity();
      }
    );

    setTimeout(() => {
      (document.activeElement as HTMLElement).blur();
    }, 0);
  }

  add() {
    this.addRoleGivenForm.markAllAsTouched();

    if (!this.addRoleGivenForm.valid) {
      return;
    }

    this.ref.close();

    let payload: ToBackendCreateRoleGivenRequestPayload = {
      projectId: this.dataItem.role.projectId,
      roleId: this.dataItem.role.roleId,
      givenId: this.addRoleGivenForm.value.givenId,
      values: ValidationService.parseGivenValues({
        values: this.addRoleGivenForm.value.values
      })
    };

    let apiService: ApiService = this.dataItem.apiService;

    apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendCreateRoleGiven,
        payload: payload,
        showSpinner: true
      })
      .pipe(
        tap((resp: ToBackendCreateRoleGivenResponse) => {
          if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
            this.memberQuery.update(resp.payload.userMember);
            this.rolesQuery.update({ roles: resp.payload.roles });
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
