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
import type { Member } from '#common/types/backend/parts/member';
import type { Role } from '#common/types/backend/parts/role';
import type { ToBackendEditMemberRequest } from '#common/types/backend/routes/members/edit-member/edit-member-request';
import type { ToBackendEditMemberResponse } from '#common/types/backend/routes/members/edit-member/edit-member-response';
import { SharedModule } from '#front/app/modules/shared/shared.module';
import { RolesQuery } from '#front/app/queries/roles.query';
import { TeamQuery } from '#front/app/queries/team.query';
import { ApiService } from '#front/app/services/api.service';

export interface AddRoleDialogData {
  apiService: ApiService;
  member: Member;
  i: number;
}

@Component({
  selector: 'm-add-role-dialog',
  templateUrl: './add-role-dialog.component.html',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, ReactiveFormsModule, SharedModule, NgSelectModule]
})
export class AddRoleDialogComponent implements OnInit {
  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.ref.close();
  }
  addRoleForm: FormGroup<{
    role: FormControl<string>;
  }>;

  projectId: string;

  availableRoles: Role[] = [];

  constructor(
    public ref: DialogRef<AddRoleDialogData>,
    private fb: FormBuilder,
    private teamQuery: TeamQuery,
    private rolesQuery: RolesQuery
  ) {}

  ngOnInit() {
    let rolesState = this.rolesQuery.getValue();
    this.availableRoles = rolesState.roles.filter(
      role => this.ref.data.member.roles.indexOf(role.roleId) < 0
    );

    this.addRoleForm = this.fb.group({
      role: this.fb.control<string>(undefined, [Validators.required])
    });

    setTimeout(() => {
      (document.activeElement as HTMLElement).blur();
    }, 0);
  }

  add() {
    this.addRoleForm.markAllAsTouched();

    if (!this.addRoleForm.valid) {
      return;
    }

    this.ref.close();

    let member: Member = this.ref.data.member;

    let payload: ToBackendEditMemberRequest['input'] = {
      projectId: member.projectId,
      memberId: member.memberId,
      isAdmin: member.isAdmin,
      isEditor: member.isEditor,
      isExplorer: member.isExplorer,
      roles: [...member.roles, this.addRoleForm.value.role]
    };

    let apiService: ApiService = this.ref.data.apiService;

    apiService
      .req({
        route: 'api/ToBackendEditMember',
        payload: payload,
        showSpinner: true
      })
      .pipe(
        tap((resp: ToBackendEditMemberResponse) => {
          if (resp?.type === 'Success') {
            let teamState = this.teamQuery.getValue();

            teamState.members[this.ref.data.i] = resp.output.member;

            this.teamQuery.update({
              members: [...teamState.members],
              total: teamState.total
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
