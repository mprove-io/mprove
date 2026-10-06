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
import { NgSelectModule } from '@ng-select/ng-select';
import { DialogRef } from '@ngneat/dialog';
import { take, tap } from 'rxjs/operators';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { Given } from '#common/types/backend/parts/given/given';
import type { GivenType } from '#common/types/backend/parts/given/given-type';
import type { Role } from '#common/types/backend/parts/role';
import type { ToBackendCreateRoleGivenRequest } from '#common/types/backend/routes/roles/create-role-given/create-role-given-request';
import type { ToBackendCreateRoleGivenResponse } from '#common/types/backend/routes/roles/create-role-given/create-role-given-response';
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

  addRoleGivenForm: FormGroup<{
    givenId: FormControl<string>;
    values: FormControl<string>;
  }>;

  availableGivens: Given[] = [];

  selectedGivenType: GivenType;
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
      givenId: this.fb.control<string>(undefined, [Validators.required]),
      values: this.fb.control<string>(undefined, [
        Validators.maxLength(10000),
        ValidationService.givenValuesValidator({
          getType: () => this.selectedGivenType,
          getIsMultiple: () => this.selectedGivenIsMultiple
        })
      ])
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

    let payload: ToBackendCreateRoleGivenRequest['input'] = {
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
        route: 'api/ToBackendCreateRoleGiven',
        payload: payload,
        showSpinner: true
      })
      .pipe(
        tap((resp: ToBackendCreateRoleGivenResponse) => {
          if (resp?.type === 'Success') {
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
